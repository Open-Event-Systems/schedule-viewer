import slugify from "slugify"

export const makeId = (s: string): string => {
  // @ts-ignore
  return slugify(s.toLowerCase())
}
