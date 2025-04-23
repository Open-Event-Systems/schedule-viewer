# Configuration

## App Configuration

The application is configured via JavaScript variables set in `config.js`.

- `scheduleTheme`: a [Mantine theme](https://mantine.dev/theming/theme-object/)
  object that overrides the default theme.
- `scheduleColorScheme`: "light" or "dark" to force the color scheme used by the
  theme.
- `scheduleBasePath`: for browser routing, the base path the schedule
  application is hosted at. This must end in a `/`.
  For hash routing, set this to the empty string.
- `scheduleServiceWorker`: a boolean, whether to enable the use of a service
  worker to make the app usable offline.
- `schedulePrecacheFiles`: an array of extra file paths for the service worker
  to precache. Paths are relative to the application's directory.
- `scheduleRouter`: "hash" or "browser". Whether to use hash or
  browser routing.
  Use "hash" if you cannot configure your web server to support fallback
  navigation.

## Schedule Configuration

The schedule settings are specified in JSON format in `config.json`.

The available properties are:

- `id`: the schedule ID.
- `events`: the URL of the events JSON, or an array of event data.
- `bookmarks`: the optional URL of the bookmarks service.
- `title`: the schedule title.
- `description`: a description of the schedule. Markdown may be used.
- `homeURL`: an optional URL that the title links to.
- `icalPrefix`: a prefix added to internal event IDs when exported as iCalendar.
  The schedule ID is a good choice.
- `icalDomain`: the domain name of the site, added to the internal event IDs
  when exported as iCalendar.
- `dayChangeHour`: the hour (starting from 0) at which the next day begins.
  Normally, a new calendar day begins at midnight (hour 0), but humans would
  typically consider an event occurring at 1 AM to be part of the previous day.
  Defaults to 6 (events occurring before 6 AM are shown on the previous day's
  schedule).
- `binMinutes`: events are grouped into bins lasting this many minutes. 60 must
  be divisible by this number. Defaults to 30 (events are grouped into 11:00 AM,
  11:30 AM, 12:00 PM slots, and so on).
- `timeZone`: the identifier of the time zone that the events occur in. All
  times will be displayed in this time zone.
  Example: "America/New_York".
- `tags`: an array of tuples of event tags and their titles.
  Example: `[["meet-and-greet", "Meet & Greet"]]` defines 1 tag with the ID
  `meet-and-greet` which will be displayed as "Meet & Greet".
- `tagIndicators`: an array of tuples of event tags (or combinations of tags)
  and an indicator that will be displayed next to the event in the listing. The
  first matching entry is used.
  Example: `[["mature", "18+"], [["a", "b"], "a+b"]]` specifies that any event
  tagged "mature" displays "18+" next to it. Any event with _both_ "a" and "b"
  displays "a+b".
- `map`: the map configuration object. Omit this key to disable the map.

## Map Configuration

The map configuration is a JSON object with the following properties:

- `src`: the URL of the SVG document.
- `levels`: an array of objects with an `id` and `title` property, describing
  available map levels. Levels should be listed from highest to lowest.
- `defaultLevel`: the ID of the default level when the map is opened.
- `layers`: an array of objects with an `id` and `title` property, describing
  available map layers.
- `locations`: An array of map locations, with the following properties:
  - `id`: the locatin ID.
  - `title`: the location title.
  - `description`: an optional description.
  - `type`: either "location" or "vendor". Defaults to "location".
  - `level`: the level the location is on.
  - `aliases`: an optional array of aliases for this location.
    An event with a location matching any of these aliases will link to this
    location.
  - `zoomScale`: an optional scale to zoom in when opening the map to this
    location.
- `vendors`: an array of vendors, with the following properties:
  - `name`: the vendor name.
  - `location`: the ID of the location this vendor is at.
  - `description`: an optional description.
  - `icon`: an optional URL to an icon.
- `flags`: an array of flags to set on the map.
  Can be one of the following:
  - A string, to unconditionally set the flag with that ID.
  - An object, to set the flag only during specific times:
    - `flag`: the flag ID
    - `start`: the optional start time before which the flag will not be set.
    - `end`: the optional end time after which the flag will not be set.
- `minScale`: the minimum scale value.
- `maxScale`: the maximum scale value.
