package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SessionSelectionsType string

const (
	Bookmarks SessionSelectionsType = "bookmarks"
	Visited   SessionSelectionsType = "visited"
)

type SessionSelections struct {
	ScheduleId   string                `gorm:"primaryKey"`
	SessionId    string                `gorm:"primaryKey"`
	Type         SessionSelectionsType `gorm:"primaryKey"`
	SelectionsId string
	UpdatedAt    ISOTime
}

func (SessionSelections) TableName() string {
	return "session_selections"
}

func (db *DB) GetSessionSelections(scheduleId string, sessionId string, typ SessionSelectionsType) (SessionSelections, error) {
	q := gorm.G[SessionSelections](db.s).Where("schedule_id = ?", scheduleId).Where("session_id = ?", sessionId)
	q = q.Where("type = ?", typ)
	return findOne(db.ctx, q)
}

func (db *DB) SetSessionSelections(scheduleId string, sessionId string, typ SessionSelectionsType, selsId string) (SessionSelections, error) {
	now := time.Now()
	cur, err := db.GetSessionSelections(scheduleId, sessionId, typ)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// new record
		ssel := SessionSelections{
			ScheduleId:   scheduleId,
			SessionId:    sessionId,
			Type:         typ,
			SelectionsId: selsId,
			UpdatedAt:    ISOTime{Time: now},
		}
		res := db.s.Clauses(clause.OnConflict{UpdateAll: true}).Create(&ssel)
		return ssel, res.Error
	} else if err != nil {
		return cur, err
	}

	if cur.SelectionsId == selsId {
		// no update, do nothing
		return cur, nil
	}

	cur.SelectionsId = selsId
	cur.UpdatedAt = ISOTime{Time: now}

	q := gorm.G[SessionSelections](db.s).Where("schedule_id = ?", scheduleId)
	q = q.Where("session_id = ?", sessionId).Where("type = ?", typ)
	_, err = q.Select("selections_id", "updated_at").Updates(db.ctx, cur)
	return cur, err
}

func (db *DB) GetSelectionCounts(scheduleId string, typ SessionSelectionsType) (map[string]int, error) {
	maxDatesSq := db.s.Table("sessions").Select("partial_ip", "MAX(unixepoch(updated_at, 'subsec')) AS maxdate")
	maxDatesSq = maxDatesSq.Where("schedule_id = ?", scheduleId).Group("partial_ip")

	cq := db.s.Table("sessions").Select("si.item_id AS item_id", "COUNT(1) AS ct")
	cq = cq.Where("sessions.schedule_id = ?", scheduleId)
	cq = cq.Joins(
		"JOIN (?) AS maxdates ON maxdates.partial_ip = sessions.partial_ip "+
			"AND maxdates.maxdate = unixepoch(sessions.updated_at, 'subsec')",
		maxDatesSq,
	)
	cq = cq.Joins(
		"JOIN session_selections ss ON ss.schedule_id = sessions.schedule_id "+
			"AND ss.session_id = sessions.id AND type = ?",
		typ,
	)
	cq = cq.Joins(
		"JOIN selections_items si ON si.schedule_id = ss.schedule_id " +
			"AND si.selections_id = ss.selections_id",
	)
	cq = cq.Group("si.item_id")

	results := map[string]int{}
	records := []struct {
		ItemId string
		Ct     int
	}{}

	res := cq.Find(&records)
	if res.Error != nil {
		return results, res.Error
	}

	for _, row := range records {
		results[row.ItemId] = row.Ct
	}

	return results, nil
}
