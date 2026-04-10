import {
  Box,
  Text,
  Title,
  useProps,
  type BoxProps,
  type TextProps,
  type TitleProps,
} from "@mantine/core"
import clsx from "clsx"
import { useMemo, type ComponentPropsWithoutRef, type ReactNode } from "react"

import classes from "./bins.module.scss"
import { iterToArr } from "@open-event-systems/schedule-lib"

type Bin<T> = Readonly<{
  key: string
  title?: ReactNode
  items?: Iterable<T>
}>

export type BinsProps<T, InT = T> = {
  /**
   * The bins.
   */
  bins?: Iterable<Bin<T>>

  /**
   * A function that groups items into bins.
   */
  binFunc?: (items: Iterable<InT>) => Iterable<Bin<T>>

  /**
   * The items to group into bins.
   */
  items?: Iterable<InT>

  /**
   * A function to render a bin element.
   */
  renderBin: (props: ComponentPropsWithoutRef<"div">, bin: Bin<T>) => ReactNode

  /**
   * The component title.
   */
  title?: ReactNode

  /**
   * Customize the rendering of the title element.
   */
  renderTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode

  /**
   * Customize the no items message.
   */
  renderNoItems?: (props: ComponentPropsWithoutRef<"div">) => ReactNode
} & Omit<BinsRootProps, "title">

/**
 * Renders data grouped into bins.
 */
const _Bins = <T, InT = T>(props: BinsProps<T, InT>) => {
  const {
    bins: propBins,
    binFunc,
    items,
    renderBin,
    title,
    renderTitle,
    renderNoItems,
    ...other
  } = useProps(
    "Bins",
    {
      renderTitle: (props: ComponentPropsWithoutRef<"h2">) => <h2 {...props} />,
    },
    props,
  )

  const binEls = useMemo(() => {
    let bins: readonly Bin<T>[]

    if (propBins) {
      bins = iterToArr(propBins)
    } else if (items && binFunc) {
      bins = iterToArr(binFunc(items))
    } else {
      bins = []
    }

    return bins.map((b) => (
      <Bins.Bin key={b.key} renderRoot={(props) => renderBin(props, b)} />
    ))
  }, [propBins, items, binFunc])

  return (
    <Bins.Root {...other}>
      {title && <Bins.Title renderRoot={renderTitle}>{title}</Bins.Title>}
      {binEls.length > 0 ? binEls : <Bins.NoItems renderRoot={renderNoItems} />}
    </Bins.Root>
  )
}

_Bins.displayName = "Bins"

export type BinsRootProps = {
  renderRoot?: (props: ComponentPropsWithoutRef<"div">) => ReactNode
} & BoxProps &
  ComponentPropsWithoutRef<"div">

export const BinsRoot = (props: BinsRootProps) => {
  const { className, ...other } = useProps("BinsRoot", null, props)

  return (
    <Box className={clsx("Bins-root", classes.root, className)} {...other} />
  )
}

export type BinsTitleProps = {
  renderRoot?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
} & TitleProps

export const BinsTitle = (props: BinsTitleProps) => {
  const { className, ...other } = useProps("BinsTitle", null, props)

  return (
    <Title className={clsx("Bins-title", className)} order={2} {...other} />
  )
}

export type BinsBinProps = {
  renderRoot?: (props: ComponentPropsWithoutRef<"div">) => ReactNode
} & BoxProps &
  ComponentPropsWithoutRef<"div">

export const BinsBin = (props: BinsBinProps) => {
  const { className, ...other } = useProps("BinsBin", null, props)

  return <Box className={clsx("Bins-bin", className)} {...other} />
}

export type BinsNoItemsProps = {
  renderRoot?: (props: ComponentPropsWithoutRef<"p">) => ReactNode
} & TextProps &
  ComponentPropsWithoutRef<"p">

export const BinsNoItems = (props: BinsNoItemsProps) => {
  const { className, ...other } = useProps("BinsNoItems", null, props)

  return (
    <Text
      className={clsx("Bins-noItems", className)}
      c="dimmed"
      ta="center"
      {...other}
    >
      No items
    </Text>
  )
}

export const Bins = Object.assign(_Bins, {
  Root: BinsRoot,
  Title: BinsTitle,
  Bin: BinsBin,
  NoItems: BinsNoItems,
})
