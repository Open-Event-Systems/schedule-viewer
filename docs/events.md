# Events

Events are specified by JSON objects with the following structure:

- `id`: an identifier for this event. This is the only required property.
  It may only contain letters, numbers, and `-`.
- `title`: the event title.
- `description`: the event description. Markdown is supported.
- `location`: the name of the event's location.
  If the map is configured, and this value matches a location's ID, title, or
  alias, it will link to the map.
- `start`: the start date and time, as an ISO 8601 string.
- `end`: the end date and time, as an ISO 8601 string.
- `hosts`: an array of the event hosts.
  Array entries may be strings (hosts' names), or objects:
  - `name`: the host's name.
  - `url`: an optional URL to the host's profile/page.
- `tags`: an array of tags.
