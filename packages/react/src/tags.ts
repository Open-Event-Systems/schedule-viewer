import { createContext, use } from "react"

/**
 * Controls how a tag is displayed.
 */
export type TagConfig = Readonly<{
  value: string
  label: string
  color?: string
  indicator?: string
  indicatorColor?: string
  textColor?: string
  before?: string
  after?: string
}>

/**
 * Properties controlling how to display something described by tags.
 */
export type TagViewProps = Readonly<{
  color?: string | Iterable<string>
  indicator?: string
  indicatorColor?: string
  textColor?: string
  before?: string
  after?: string
}>

export type TagsConfig = Readonly<{
  [Symbol.iterator]: () => Iterator<TagConfig>
  get: (tag: string) => TagConfig | undefined
  getViewProps: (...tags: string[]) => TagViewProps
}>

/**
 * Create a {@link TagsConfig} object.
 */
export const makeTagsConfig = (config: {
  tags?: {
    readonly [tag: string]: Partial<Omit<TagConfig, "value">>
  }
}): TagsConfig => {
  const entries = new Map<string, TagConfig>()
  const byLabel = new Map<string, TagConfig>()

  for (const [tag, cfg] of Object.entries(config.tags ?? {})) {
    const entry = {
      ...cfg,
      value: tag,
      label: cfg.label || tag,
    }

    entries.set(tag, entry)
    byLabel.set(entry.label, entry)
  }

  const get = (t: string): TagConfig | undefined => {
    const res = entries.get(t)
    if (res) {
      return res
    }

    return byLabel.get(t)
  }

  return {
    [Symbol.iterator]: () => entries.values(),
    get,
    getViewProps: (...tags) => {
      const propsArr = tags.map((t) => get(t)).filter((c) => !!c)

      const before = propsArr.reduce<string | undefined>(
        (p, c) => (c.before ? (p || "") + c.before : p),
        undefined,
      )
      const after = propsArr.reduce<string | undefined>(
        (p, c) => (c.after ? (p || "") + c.after : p),
        undefined,
      )
      const colors = propsArr
        .map((p) => p.color)
        .filter((c): c is string => !!c)
      let color

      if (colors.length == 1) {
        color = colors[0]
      } else if (colors.length > 1) {
        color = colors
      }

      const textColor = propsArr.reduce<string | undefined>(
        (p, c) => (!p ? c.textColor : p),
        undefined,
      )
      const indicator = propsArr.reduce<string | undefined>(
        (p, c) => (!p ? c.indicator : p),
        undefined,
      )
      const indicatorColor = propsArr.reduce<string | undefined>(
        (p, c) => (!p ? c.indicatorColor : p),
        undefined,
      )

      return {
        before,
        after,
        color,
        indicator,
        indicatorColor,
        textColor,
      }
    },
  }
}

export const TagsConfigContext = createContext<TagsConfig>(makeTagsConfig({}))

export const useTagsConfig = (): TagsConfig => use(TagsConfigContext)
