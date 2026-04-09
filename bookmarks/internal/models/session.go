package models

import (
	"time"

	gonanoid "github.com/matoous/go-nanoid/v2"
	"gorm.io/gorm"
)

type Session struct {
	Id         string `gorm:"primaryKey"`
	ScheduleId string
	CreatedAt  ISOTime
	UpdatedAt  ISOTime
	IP         string
	PartialIP  string
}

func (Session) TableName() string {
	return "sessions"
}

const idAlphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const idSize = 14

func NewSessionId() string {
	return "bkmsess_" + gonanoid.MustGenerate(idAlphabet, idSize)
}

func (db *DB) CreateSession(sess Session) (Session, error) {
	now := time.Now()

	sess.Id = NewSessionId()
	sess.CreatedAt = ISOTime{Time: now}
	sess.UpdatedAt = ISOTime{Time: now}

	err := gorm.G[Session](db.s).Create(db.ctx, &sess)
	return sess, err
}

func (db *DB) GetSession(scheduleId string, id string) (Session, error) {
	return gorm.G[Session](db.s).Where("schedule_id = ?").Where("id = ?", id).First(db.ctx)
}

func (db *DB) UpdateSession(scheduleId string, id string, ip string, partialIP string) (int, error) {
	now := time.Now()
	q := gorm.G[Session](db.s).Where("schedule_id = ?", scheduleId).Where("id = ?", id).Select("updated_at", "ip", "partial_ip")
	return q.Updates(db.ctx, Session{UpdatedAt: ISOTime{Time: now}, IP: ip, PartialIP: partialIP})
}
