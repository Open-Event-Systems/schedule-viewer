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
import {
  iterToArr,
  type Bin,
  type BinFunc,
} from "@open-event-systems/schedule-lib"

export type BinsProps<InT, OutT extends InT = InT> = {
  /**
   * The bins.
   */
  bins?: Iterable<Bin<OutT>>

  /**
   * A function that groups items into bins.
   */
  binFunc?: BinFunc<InT, OutT>

  /**
   * The items to group into bins.
   */
  items?: Iterable<InT>

  /**
   * A function to render a bin element.
   */
  renderBin: (
    props: ComponentPropsWithoutRef<"div">,
    bin: Bin<OutT>,
  ) => ReactNode

  /**
   * The component name.
   */
  name?: ReactNode

  /**
   * Customize the rendering of the title element.
   */
  renderTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode

  /**
   * Customize the no items message.
   */
  renderNoItems?: (props: ComponentPropsWithoutRef<"div">) => ReactNode
} & Omit<BinsRootProps, "name">

/**
 * Renders data grouped into bins.
 */
const _Bins = <InT, OutT extends InT = InT>(props: BinsProps<InT, OutT>) => {
  const {
    bins: propBins,
    binFunc,
    items,
    renderBin,
    name,
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
    let bins: readonly Bin<OutT>[]

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
      {name && <Bins.Title renderRoot={renderTitle}>{name}</Bins.Title>}
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
