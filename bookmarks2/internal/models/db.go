package models

import (
	"context"

	"gorm.io/gorm"
)

type DB struct {
	s   *gorm.DB
	ctx context.Context
}

func NewDB(ctx context.Context, conn *gorm.DB) *DB {
	return &DB{s: conn, ctx: ctx}
}

func (outerDB *DB) WithTx(f func(db *DB) error) error {
	return outerDB.s.Transaction(func(tx *gorm.DB) error {
		return f(NewDB(outerDB.ctx, tx))
	})
}

func findOne[T any](ctx context.Context, db gorm.ChainInterface[T]) (T, error) {
	var result T
	resSlice, err := db.Limit(1).Find(ctx)
	if err != nil {
		return result, err
	}

	if len(resSlice) == 0 {
		return result, gorm.ErrRecordNotFound
	}

	return resSlice[0], nil
}
