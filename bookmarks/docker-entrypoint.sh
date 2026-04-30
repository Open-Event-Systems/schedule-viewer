#!/bin/sh
set -e

if [ ! -z "$MIGRATE_DB" ]; then
	echo "applying migrations to $MIGRATE_DB" >&2
	migrate \
		-path /migrations \
		-database sqlite3://"$MIGRATE_DB" \
		up
fi

exec /usr/local/bin/bookmarks-server "$@"
