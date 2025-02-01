/**
 * Turn a date into a percentage within a date range.
 */
export const toPercent = (start: Date, end: Date, t: Date): number => {
  const cStartT = start.getTime()
  const cEndT = end.getTime()
  const cRange = cEndT - cStartT

  return (t.getTime() - cStartT) / cRange
}
