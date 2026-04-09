package models

import (
	"bookmarks/internal/selections"
	"slices"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ScheduleSelections struct {
	ScheduleId string `json:"schedule_id" gorm:"primaryKey"`
	Id         string `json:"id" gorm:"primaryKey"`
}

func (ScheduleSelections) TableName() string {
	return "schedule_selections"
}

type SelectionsItem struct {
	ScheduleId   string `gorm:"primaryKey"`
	SelectionsId string `gorm:"primaryKey"`
	ItemId       string `gorm:"primaryKey"`
}

func (SelectionsItem) TableName() string {
	return "selections_items"
}

func (db *DB) SelectionsExists(scheduleId string, id string) (bool, error) {
	var found bool
	res := db.s.Raw("SELECT EXISTS(SELECT 1 FROM schedule_selections WHERE schedule_id = ? AND id = ?)", scheduleId, id).Scan(&found)
	return found, res.Error
}

func (db *DB) GetSelections(scheduleId string, id string) (selections.Selections, error) {
	var sel selections.Selections
	items, err := gorm.G[SelectionsItem](db.s).Where("schedule_id = ?", scheduleId).Where("selections_id = ?", id).Find(db.ctx)
	if err != nil {
		return sel, err
	}

	itemIds := slices.Collect(func(yield func(string) bool) {
		for _, row := range items {
			if !yield(row.ItemId) {
				return
			}
		}
	})

	sel = selections.NewSelections(itemIds...)
	return sel, nil
}

func (db *DB) SetSelections(scheduleId string, sels selections.Selections) error {
	ssels := ScheduleSelections{ScheduleId: scheduleId, Id: sels.Id()}
	if res := db.s.Clauses(clause.OnConflict{DoNothing: true}).Create(&ssels); res.Error != nil {
		return res.Error
	}

	selId := sels.Id()

	itemModels := slices.Collect(func(yield func(m SelectionsItem) bool) {
		for item := range sels.Iter() {
			si := SelectionsItem{
				ScheduleId:   scheduleId,
				SelectionsId: selId,
				ItemId:       item,
			}
			if !yield(si) {
				return
			}
		}
	})

	res := db.s.Clauses(clause.OnConflict{DoNothing: true}).Create(&itemModels)
	return res.Error
}
