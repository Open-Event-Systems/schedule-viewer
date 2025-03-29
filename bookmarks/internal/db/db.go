package db

import (
	"bookmarks/internal/selection"
	"database/sql"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	conn *sql.DB
}

func NewDB(path string) *DB {
	conn, err := sql.Open("sqlite3", path)
	if err != nil {
		panic(err)
	}

	return &DB{
		conn: conn,
	}
}

func (db *DB) Init() {
	if _, err := db.conn.Exec(
		"CREATE TABLE IF NOT EXISTS schedule_selection (" +
			"schedule_id TEXT NOT NULL, " +
			"selection_hash TEXT NOT NULL, " +
			"event_id TEXT NOT NULL, " +
			"PRIMARY KEY (schedule_id, selection_hash, event_id)" +
			");",
	); err != nil {
		panic(err)
	}

	if _, err := db.conn.Exec(
		"CREATE INDEX IF NOT EXISTS ix_schedule_selection_event " +
			"ON schedule_selection (schedule_id, event_id)",
	); err != nil {
		panic(err)
	}

	if _, err := db.conn.Exec(
		"CREATE TABLE IF NOT EXISTS session (" +
			"id TEXT NOT NULL, " +
			"schedule_id TEXT NOT NULL, " +
			"date TEXT NOT NULL, " +
			"selection_hash TEXT NOT NULL, " +
			"PRIMARY KEY (id, schedule_id)" +
			");",
	); err != nil {
		panic(err)
	}

	if _, err := db.conn.Exec(
		"CREATE INDEX IF NOT EXISTS ix_session_schedule_selection_hash " +
			"ON session (schedule_id, selection_hash)",
	); err != nil {
		panic(err)
	}

}

func (db *DB) Close() error {
	return db.conn.Close()
}

func (db *DB) SaveSelection(scheduleId string, set *selection.Selection) (string, error) {
	hash := set.Hash()

	tx, err := db.conn.Begin()
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	cur := tx.QueryRow("SELECT COUNT(1) FROM schedule_selection WHERE schedule_id = ? AND selection_hash = ?", scheduleId, hash)
	var curCount int
	err = cur.Scan(&curCount)
	if err == nil && curCount > 0 {
		return hash, nil
	}

	stmt, err := tx.Prepare("INSERT INTO schedule_selection VALUES (?, ?, ?) ON CONFLICT DO NOTHING")
	if err != nil {
		return "", err
	}

	for _, eventId := range set.GetEventIds() {
		if _, err := stmt.Exec(scheduleId, hash, eventId); err != nil {
			return "", err
		}
	}

	if err = tx.Commit(); err != nil {
		return "", err
	}

	return hash, nil
}

func (db *DB) GetSelection(scheduleId string, hash string) (*selection.Selection, error) {
	res, err := db.conn.Query("SELECT event_id FROM schedule_selection WHERE schedule_id = ? AND selection_hash = ?", scheduleId, hash)
	if err != nil {
		return nil, err
	}

	results := make([]string, 0)

	for res.Next() {
		var event string
		if err := res.Scan(&event); err != nil {
			return nil, err
		}
		results = append(results, event)
	}

	return selection.NewSelection(results), nil
}

func (db *DB) SetSessionSelection(sessionId string, scheduleId string, hash string) (string, error) {
	tx, err := db.conn.Begin()
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	now := time.Now().Format(time.RFC3339Nano)

	if _, err = tx.Exec(
		"INSERT INTO session VALUES (?, ?, ?, ?) ON CONFLICT DO UPDATE SET selection_hash = ?, date = ?", sessionId, scheduleId, now, hash, hash, now,
	); err != nil {
		return "", err
	}
	tx.Commit()

	return now, nil
}

func (db *DB) GetSessionSelection(sessionId string, scheduleId string) (*selection.Selection, string, error) {
	hashRow := db.conn.QueryRow("SELECT selection_hash, date FROM session WHERE schedule_id = ? AND id = ?", scheduleId, sessionId)
	var hash string
	var date string
	var err error
	if err = hashRow.Scan(&hash, &date); err != nil && err != sql.ErrNoRows {
		return nil, "", err
	}

	if err == sql.ErrNoRows {
		return nil, "", nil
	}

	selection, err := db.GetSelection(scheduleId, hash)

	return selection, date, err
}

func (db *DB) GetEventSelectionCounts(scheduleId string) (map[string]int, error) {
	res, err := db.conn.Query(
		"SELECT sl.event_id, COUNT(1) FROM schedule_selection sl "+
			"JOIN session s ON s.schedule_id = sl.schedule_ID "+
			"AND s.selection_hash=sl.selection_hash "+
			"WHERE s.schedule_id = ? GROUP BY sl.event_id",
		scheduleId,
	)
	if err != nil {
		return nil, err
	}

	counts := make(map[string]int)
	for res.Next() {
		var eventId string
		var count int
		err = res.Scan(&eventId, &count)
		if err != nil {
			return nil, err
		}
		counts[eventId] = count
	}

	return counts, nil
}
