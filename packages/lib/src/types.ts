type JSONScalar = string | number | boolean | null
export type JSONData = JSONScalar | JSONData[] | { [key: string]: JSONData }

export type Timespan = Readonly<{
  start: Date
  end: Date
}>

export interface Host extends Record<string, unknown> {
  name?: string
  contact?: string
  url?: string
}

export interface EventJSON extends Record<string, unknown> {
  id: string
  title?: string
  description?: string
  location?: string
  start?: string
  end?: string
  hosts?: Host[]
  tags?: string[]
}

export interface Event extends Record<string, unknown> {
  id: string
  title?: string
  description?: string
  location?: string
  start?: Date
  end?: Date
  hosts?: Host[]
  tags?: string[]
}

export type ScheduledEvent = Event & {
  start: Date
  end: Date
}
