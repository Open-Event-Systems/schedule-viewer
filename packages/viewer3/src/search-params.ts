export const parseSearch = (search: string): Record<string, unknown> => {
  if (search[0] == "?") {
    search = search.substring(1)
  }

  const params = new URLSearchParams(search)
  const entries: Record<string, string[]> = {}

  for (const [k, v] of params.entries()) {
    let values = entries[k]
    if (!values) {
      values = []
      entries[k] = values
    }

    values.push(v)
  }

  const parsed: Record<string, string | string[] | undefined> = {}

  for (const [k, values] of Object.entries(entries)) {
    if (values.length <= 1) {
      parsed[k] = values[0]
    } else {
      parsed[k] = values
    }
  }

  return parsed
}

export const stringifySearch = (search: Record<string, unknown>): string => {
  const params = new URLSearchParams()

  for (const [k, values] of Object.entries(search)) {
    if (Array.isArray(values)) {
      for (const v of values) {
        params.append(k, String(v))
      }
    } else {
      if (values != null) {
        params.append(k, String(values))
      }
    }
  }

  const paramsStr = String(params)

  return paramsStr == "" ? "" : `?${paramsStr}`
}
