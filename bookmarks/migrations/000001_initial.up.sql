CREATE TABLE schedule_selections (
    schedule_id VARCHAR(128) NOT NULL,
    id VARCHAR(64) NOT NULL,
    PRIMARY KEY (schedule_id, id)
);

CREATE TABLE selections_items (
    schedule_id VARCHAR(128) NOT NULL,
    selections_id VARCHAR(64) NOT NULL,
    item_id VARCHAR(128) NOT NULL,
    PRIMARY KEY (schedule_id, selections_id, item_id),
    FOREIGN KEY (schedule_id, selections_id) REFERENCES schedule_selections(schedule_id, id)
);

CREATE TABLE sessions (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    schedule_id VARCHAR(128) NOT NULL,
    created_at VARCHAR(35) NOT NULL,
    updated_at VARCHAR(35) NOT NULL,
    ip VARCHAR(64) NOT NULL,
    partial_ip VARCHAR(64) NOT NULL
);
CREATE UNIQUE INDEX uq_sessions_schedule_id ON sessions(schedule_id, id);

CREATE TABLE session_selections (
    schedule_id VARCHAR(128) NOT NULL,
    session_id VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL,
    selections_id VARCHAR(64) NOT NULL,
    updated_at VARCHAR(35) NOT NULL,
    PRIMARY KEY (schedule_id, session_id, type),
    FOREIGN KEY (schedule_id, session_id) REFERENCES sessions(schedule_id, id)
);
