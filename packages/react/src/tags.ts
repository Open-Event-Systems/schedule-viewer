import { createContext, use, useMemo } from "react"

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

class TagsConfigImpl {
  private entries = new Map<string, TagConfig>()
  private byLabel = new Map<string, TagConfig>()

  constructor(
    tags?: Readonly<Record<string, Partial<Omit<TagConfig, "value>>">>>>,
  ) {
    for (const [tag, cfg] of Object.entries(tags ?? {})) {
      const entry = {
        ...cfg,
        value: tag,
        label: cfg.label || tag,
      }

      this.entries.set(tag, entry)
      this.byLabel.set(entry.label, entry)
    }
  }

  [Symbol.iterator] = () => this.entries.values()

  get = (tag: string) => {
    const byValue = this.entries.get(tag)
    if (byValue) {
      return byValue
    }
    return this.byLabel.get(tag)
  }

  getViewProps = (...tags: string[]) => {
    const propsArr = tags.map((t) => this.get(t)).filter((c) => !!c)

    const before = propsArr.reduce<string | undefined>(
      (p, c) => (c.before ? (p || "") + c.before : p),
      undefined,
    )
    const after = propsArr.reduce<string | undefined>(
      (p, c) => (c.after ? (p || "") + c.after : p),
      undefined,
    )
    const colors = propsArr.map((p) => p.color).filter((c): c is string => !!c)
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
  }
}

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
}): TagsConfig => new TagsConfigImpl(config.tags)

export const isTagsConfig = (obj: unknown): obj is TagsConfig =>
  obj instanceof TagsConfigImpl

export const TagsConfigContext = createContext<TagsConfig>(makeTagsConfig({}))

export const useTagsConfig = (): TagsConfig => use(TagsConfigContext)

/**
 * Get tags that appear in the given items.
 */
export const getRelevantTags = (
  tagsConfig: TagsConfig,
  items?: Iterable<{
    readonly [key: string]: unknown
    readonly item?: { readonly tags?: Iterable<string> }
  }> | null,
): TagConfig[] => {
  const seen = new Set<string>()

  for (const item of items ?? []) {
    for (const tag of item.item?.tags ?? []) {
      const cfg = tagsConfig.get(tag)
      if (cfg) {
        seen.add(tag)
      }
    }
  }

  const tags = []

  for (const cfg of tagsConfig) {
    if (seen.has(cfg.value)) {
      tags.push(cfg)
    }
  }

  return tags
}

/**
 * Hook that returns tags that appear in the given items.
 */
export const useRelevantTags = (
  items?: Iterable<{
    readonly [key: string]: unknown
    readonly item?: { readonly tags?: Iterable<string> }
  }> | null,
): TagConfig[] => {
  const tagsConfig = useTagsConfig()
  return useMemo(() => getRelevantTags(tagsConfig, items), [tagsConfig, items])
}
