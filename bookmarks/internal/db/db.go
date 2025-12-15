package db

import (
	"bookmarks/internal/bookmarks"
	"context"
	"database/sql"
	"errors"
	"time"
)

type DB struct {
	scheduleId string
	conn       *sql.Tx
	context    context.Context
}

func NewDB(ctx context.Context, scheduleId string, conn *sql.Tx) *DB {
	return &DB{
		scheduleId: scheduleId,
		conn:       conn,
		context:    ctx,
	}
}

func CreateTables(db *sql.Tx) error {
	_, err := db.Exec(
		"CREATE TABLE IF NOT EXISTS selection_item (" +
			"schedule_id TEXT NOT NULL," +
			"id TEXT NOT NULL," +
			"item_id TEXT NOT NULL," +
			"PRIMARY KEY (schedule_id, id, item_id)" +
			");",
	)

	if err != nil {
		return err
	}

	_, err = db.Exec(
		"CREATE TABLE IF NOT EXISTS session (" +
			"schedule_id TEXT NOT NULL," +
			"id TEXT NOT NULL," +
			"date TEXT NOT NULL," +
			"ip TEXT NOT NULL," +
			"partial_ip TEXT NOT NULL," +
			"selection_id TEXT NOT NULL," +
			"PRIMARY KEY (id, schedule_id)" +
			");",
	)

	if err != nil {
		return err
	}

	return nil
}

func (db *DB) SetSelections(selections *bookmarks.Selections) error {
	_, err := db.conn.ExecContext(db.context, "DELETE FROM selection_item WHERE schedule_id = ? AND id = ?", db.scheduleId, selections.Id())
	if err != nil {
		return err
	}

	stmt, err := db.conn.PrepareContext(db.context, "INSERT INTO selection_item VALUES (?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for item := range selections.Iter() {
		_, err := stmt.ExecContext(db.context, db.scheduleId, selections.Id(), item)
		if err != nil {
			return err
		}
	}

	return nil
}

func (db *DB) GetSelectionsExist(id string) (bool, error) {
	res := db.conn.QueryRowContext(
		db.context,
		"SELECT EXISTS("+
			"SELECT 1 FROM selection_item WHERE schedule_id = ? AND id = ? LIMIT 1"+
			")",
		db.scheduleId, id,
	)

	var exists bool
	err := res.Scan(&exists)
	return exists, err
}

func (db *DB) GetSelections(id string) (*bookmarks.Selections, error) {
	res, err := db.conn.QueryContext(db.context, "SELECT item_id FROM selection_item WHERE schedule_id = ? AND id = ?", db.scheduleId, id)
	if err != nil {
		return nil, err
	}
	defer res.Close()

	sels := bookmarks.NewSelections(func(yield func(string) bool) {
		for res.Next() {
			var item string
			err = res.Scan(&item)
			if err != nil {
				return
			}

			if !yield(item) {
				return
			}
		}
	})

	if err != nil {
		return nil, err
	}

	if res.Err() != nil {
		return nil, res.Err()
	}

	return sels, nil
}

func (db *DB) SetSessionSelectionId(sessionId string, id string, date time.Time, ip string, partialIp string) error {
	nowStr := date.Format(time.RFC3339Nano)

	_, err := db.conn.ExecContext(
		db.context,
		"INSERT INTO session VALUES (?, ?, ?, ?, ?, ?) "+
			"ON CONFLICT DO UPDATE SET selection_id = ?, date = ?, ip = ?, partial_ip = ?",
		db.scheduleId,
		sessionId,
		nowStr,
		ip,
		partialIp,
		id,
		id,
		nowStr,
		ip,
		partialIp,
	)

	return err
}

func (db *DB) GetSessionSelectionId(sessionId string) (string, time.Time, error) {
	row := db.conn.QueryRowContext(
		db.context,
		"SELECT date, selection_id FROM session WHERE schedule_id = ? AND id = ?",
		db.scheduleId,
		sessionId,
	)

	var (
		dateStr     string
		selectionId string
	)

	err := row.Scan(&dateStr, &selectionId)
	if errors.Is(err, sql.ErrNoRows) {
		return "", time.Time{}, nil
	} else if err != nil {
		return "", time.Time{}, err
	}

	date, _ := time.Parse(time.RFC3339Nano, dateStr)

	return selectionId, date, nil
}
