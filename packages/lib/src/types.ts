type JSONScalar = string | number | boolean | null
export type JSONData = JSONScalar | JSONData[] | { [key: string]: JSONData }

export type Timespan = Readonly<{
  start: Date
  end: Date
}>

export interface EventJSON {
  id: string
  title: string
  description: string
  location: string | null
  start: string | null
  end: string | null
}

export interface Event {
  id: string
  title: string
  description: string
  location: string | null
  start: Date | null
  end: Date | null
}

export type ScheduledEvent = Event & {
  start: Date
  end: Date
}
