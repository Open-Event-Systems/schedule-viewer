import {
  Box,
  Divider,
  Text,
  Title,
  useProps,
  type DividerProps,
  type TitleProps,
} from "@mantine/core"
import clsx from "clsx"
import { useMemo, type AllHTMLAttributes, type ReactNode } from "react"

import classes from "./bins.module.scss"
import {
  iterToArr,
  type Bin,
  type BinFunc,
} from "@open-event-systems/schedule-lib"
import type { DefaultBoxProps } from "../types.js"

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
    props: AllHTMLAttributes<HTMLElement>,
    bin: Bin<OutT>,
  ) => ReactNode

  /**
   * Customize the rendering of the bin title element.
   */
  renderBinTitle?: (
    props: AllHTMLAttributes<HTMLHeadingElement>,
    bin: Bin<OutT>,
  ) => ReactNode

  /**
   * Customize the no items message.
   */
  renderNoItems?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode
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
    renderBinTitle,
    renderNoItems,
    ...other
  } = useProps(
    "Bins",
    {
      renderBinTitle: Bins.defaultRenderBinTitle,
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
      <Bins.Bin key={b.key}>
        {b.name && (
          <Bins.BinTitle
            renderRoot={(props) =>
              (renderBinTitle || defaultRenderBinTitle)(props, b)
            }
          >
            {b.name}
          </Bins.BinTitle>
        )}
        {b.name && <Bins.Divider />}
        <Bins.BinContent renderRoot={(props) => renderBin(props, b)} />
      </Bins.Bin>
    ))
  }, [propBins, items, binFunc, renderBinTitle])

  return (
    <Bins.Root {...other}>
      {binEls.length > 0 ? binEls : <Bins.NoItems renderRoot={renderNoItems} />}
    </Bins.Root>
  )
}

_Bins.displayName = "Bins"

export type BinsRootProps = DefaultBoxProps

export const BinsRoot = (props: BinsRootProps) => {
  const { className, ...other } = useProps("BinsRoot", null, props)

  return (
    <Box className={clsx("Bins-root", classes.root, className)} {...other} />
  )
}

export type BinsDividerProps = DividerProps &
  Omit<DefaultBoxProps<"hr">, "children">

export const BinsDivider = (props: BinsDividerProps) => {
  const { className, ...other } = useProps("BinsDivider", null, props)

  return (
    <Divider
      className={clsx("Bins-divider", classes.binDivider, className)}
      {...other}
    />
  )
}

export type BinsBinProps = DefaultBoxProps

export const BinsBin = (props: BinsBinProps) => {
  const { className, ...other } = useProps("BinsBin", null, props)

  return (
    <Box
      component="section"
      className={clsx("Bins-bin", classes.bin, className)}
      {...other}
    />
  )
}

export type BinsBinTitleProps = TitleProps & DefaultBoxProps<"h3">

export const BinsBinTitle = (props: BinsBinTitleProps) => {
  const { className, ...other } = useProps("BinsBinTitle", null, props)

  return (
    <Title
      className={clsx("Bins-binTitle", classes.binTitle, className)}
      order={3}
      {...other}
    />
  )
}

export type BinsBinContentProps = DefaultBoxProps

export const BinsBinContent = (props: BinsBinContentProps) => {
  const { className, ...other } = useProps("BinsBinContent", null, props)

  return (
    <Box
      className={clsx("BinsBin-content", classes.binContent, className)}
      {...other}
    />
  )
}
export type BinsNoItemsProps = Omit<
  DefaultBoxProps,
  "children" | "size" | "span"
>

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

const defaultRenderBinTitle = (
  props: AllHTMLAttributes<HTMLHeadingElement>,
) => <h2 {...props} />

export const Bins = Object.assign(_Bins, {
  Root: BinsRoot,
  Bin: BinsBin,
  BinTitle: BinsBinTitle,
  Divider: BinsDivider,
  BinContent: BinsBinContent,
  NoItems: BinsNoItems,
  defaultRenderBinTitle,
})
