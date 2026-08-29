import { Box, Button, Text, useProps, type TextProps } from "@mantine/core"
import clsx from "clsx"
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  type AllHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import classes from "./tag-filter.module.scss"
import { Pill, type PillBoxProps, type PillProps } from "../newpill/pill.js"
import type { DefaultBoxProps } from "../types.js"
import { iterToArr } from "@open-event-systems/schedule-lib"

export type TagFilterTagData = Readonly<{
  value: string
  label?: string
  color?: string
  indicator?: ReactNode
  indicatorColor?: string
  textColor?: string
  before?: string
  after?: string
}>

export type TagFilterMode = "exclude" | "include"

export type TagFilterProps = {
  /**
   * The label.
   */
  label?: ReactNode

  /**
   * The filter mode.
   */
  mode?: TagFilterMode

  /**
   * The set of tags that have been disabled.
   */
  disabledTags?: Iterable<string>

  /**
   * A collection of {@link TagFilterTagData} objects representing the displayable tags.
   */
  tags?: Iterable<string | TagFilterTagData>

  /**
   * Handler to set a tag disabled/enabled.
   */
  onSetDisabled?: (tag: string, disabled: boolean) => void

  /**
   * Handler to set the tag filter mode.
   */
  onSetMode?: (mode: TagFilterMode) => void
} & TagFilterRootProps

/**
 * Tag filter component.
 */
const _TagFilter = (props: TagFilterProps) => {
  const {
    label,
    disabledTags,
    mode,
    tags,
    onSetDisabled,
    onSetMode,
    ...other
  } = useProps("TagFilter", {}, props)

  const disabledTagsSet = useMemo(() => {
    if (disabledTags instanceof Set) {
      return disabledTags
    } else {
      return new Set(disabledTags)
    }
  }, [disabledTags])

  const tagEls = useMemo(() => {
    return iterToArr(tags).map((tag) => {
      const {
        value,
        label,
        color,
        before,
        after,
        indicator,
        indicatorColor,
        textColor,
      } = typeof tag == "string" ? { value: tag } : tag

      return (
        <TagFilter.Tag
          key={value}
          tag={value}
          label={label || value}
          color={color}
          before={before}
          after={after}
          indicator={indicator}
          indicatorColor={indicatorColor}
          textColor={textColor}
          disabled={disabledTagsSet.has(value)}
          onSetDisabled={onSetDisabled}
        />
      )
    })
  }, [tags, disabledTagsSet, onSetDisabled])

  const labelId = useId()

  return (
    <TagFilter.Root role="group" aria-labelledby={label && labelId} {...other}>
      {label && (
        <TagFilter.Label id={labelId} size="xs">
          {label}
        </TagFilter.Label>
      )}
      <TagFilter.Tags>{tagEls}</TagFilter.Tags>
      <TagFilter.ModeSelect
        mode={mode}
        tags={tags}
        disabledTags={disabledTags}
        onSetMode={onSetMode}
        onSetDisabled={onSetDisabled}
      />
    </TagFilter.Root>
  )
}

export type TagFilterRootProps = DefaultBoxProps

export const TagFilterRoot = (props: TagFilterRootProps) => {
  const { className, ...other } = useProps("TagFilterRoot", null, props)

  return (
    <Box
      className={clsx("TagFilter-root", classes.root, className)}
      {...other}
    />
  )
}

export type TagFilterLabelProps = TextProps & Omit<DefaultBoxProps, "size">

export const TagFilterLabel = (props: TagFilterLabelProps) => {
  const { className, ...other } = useProps("TagFilterLabel", null, props)

  return (
    <Text
      span
      className={clsx("TagFilter-label", classes.label, className)}
      {...other}
    />
  )
}

export type TagFilterTagsProps = PillBoxProps

export const TagFilterTags = (props: TagFilterTagsProps) => {
  const { className, ...other } = useProps("TagFilterTags", null, props)

  return (
    <Pill.Box
      className={clsx("TagFilter-tags", className)}
      renderRoot={(props) => <menu {...props} />}
      {...other}
    />
  )
}

export type TagFilterTagProps = {
  tag: string
  label?: ReactNode
  onSetDisabled?: (tag: string, enabled: boolean) => void
} & Omit<PillProps, "label" | "children">

export const TagFilterTag = (props: TagFilterTagProps) => {
  const {
    tag,
    label,
    disabled,
    onSetDisabled,
    className,
    classNames,
    renderRoot,
    ...other
  } = useProps("TagFilterTag", {}, props)

  const wrappedRenderRoot = useCallback(
    (props: AllHTMLAttributes<HTMLElement>) => {
      const innerRender = renderRoot || defaultRenderTag

      return innerRender({
        role: "switch",
        "aria-checked": !disabled,
        onClick: () => onSetDisabled && onSetDisabled(tag, !disabled),
        ...props,
      })
    },
    [renderRoot, disabled, onSetDisabled],
  )

  return (
    <Pill
      className={clsx("TagFilter-tag", classes.tag, className)}
      classNames={{
        ...classNames,
        body: clsx("TagFilter-tagBody", classNames?.body),
      }}
      renderRoot={wrappedRenderRoot}
      disabled={disabled}
      data-tag={tag}
      {...other}
    >
      {label}
    </Pill>
  )
}

export type TagFilterModeSelectProps = {
  mode?: TagFilterMode
  tags?: Iterable<string | TagFilterTagData>
  disabledTags?: Iterable<string>
  onSetMode?: (mode: TagFilterMode) => void
  onSetDisabled?: (tag: string, enabled: boolean) => void
} & Omit<DefaultBoxProps, "children">

export const TagFilterModeSelect = (props: TagFilterModeSelectProps) => {
  const {
    className,
    mode,
    tags,
    disabledTags,
    onSetMode,
    onSetDisabled,
    ...other
  } = useProps("TagFilterModeSelect", { mode: "exclude" } as const, props)

  const labelId = useId()

  const excludeRef = useRef<HTMLButtonElement | null>(null)
  const includeRef = useRef<HTMLButtonElement | null>(null)

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key == "ArrowUp" ||
        e.key == "ArrowRight" ||
        e.key == "ArrowDown" ||
        e.key == "ArrowLeft"
      ) {
        e.preventDefault()
        const newMode = mode == "exclude" ? "include" : "exclude"
        onSetMode && onSetMode(newMode)

        if (newMode == "exclude") {
          excludeRef.current?.focus()
        } else {
          includeRef.current?.focus()
        }
      }
    },
    [mode, onSetMode, includeRef, excludeRef],
  )

  let allEnabled = true
  if (disabledTags instanceof Set) {
    allEnabled = disabledTags.size == 0
  } else {
    const arr = iterToArr(disabledTags)
    allEnabled = arr.length == 0
  }

  return (
    <Box
      className={clsx("TagFilter-modeSelect", classes.modeSelect, className)}
      role="radiogroup"
      aria-labelledby={labelId}
      {...other}
    >
      <Text
        id={labelId}
        span
        className={clsx("TagFilter-modeSelectLabel", classes.modeSelectLabel)}
      >
        Mode:
      </Text>
      <Button
        ref={excludeRef}
        unstyled
        role="radio"
        aria-checked={mode == "exclude"}
        className={clsx(
          classes.textButton,
          classes.modeSelectButton,
          mode == "exclude" && classes.checked,
        )}
        tabIndex={mode == "exclude" ? 0 : -1}
        onKeyDown={onKeyDown}
        onClick={() => onSetMode && onSetMode("exclude")}
      >
        Exclude
      </Button>
      <Button
        ref={includeRef}
        unstyled
        role="radio"
        aria-checked={mode == "include"}
        className={clsx(
          classes.textButton,
          classes.modeSelectButton,
          mode == "include" && classes.checked,
        )}
        tabIndex={mode == "include" ? 0 : -1}
        onKeyDown={onKeyDown}
        onClick={() => onSetMode && onSetMode("include")}
      >
        Include
      </Button>
      <Button
        unstyled
        className={clsx(classes.textButton, classes.selectAllButton)}
        onClick={() => {
          if (onSetDisabled) {
            if (allEnabled) {
              for (const tag of tags ?? []) {
                onSetDisabled(typeof tag == "string" ? tag : tag.value, true)
              }
            } else {
              for (const tag of disabledTags ?? []) {
                onSetDisabled(tag, false)
              }
            }
          }
        }}
      >
        Select {allEnabled ? "None" : "All"}
      </Button>
    </Box>
  )
}

const defaultRenderTag = (props: AllHTMLAttributes<HTMLElement>) => (
  <button {...props} type="button" />
)

export const TagFilter = Object.assign(_TagFilter, {
  Root: TagFilterRoot,
  Label: TagFilterLabel,
  Tags: TagFilterTags,
  Tag: TagFilterTag,
  ModeSelect: TagFilterModeSelect,
})
