import {
  Box,
  type BoxProps,
  Divider,
  Indicator,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import {
  memo,
  useCallback,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type NamedExoticComponent,
  type ReactNode,
} from "react"
import type { PillsItemBin, PillsItemType } from "./bin.js"

import binClasses from "./bin.module.scss"
import pillClasses from "./pill.module.scss"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import type {
  ItemDetailsItemType,
  ItemDetailsProps,
} from "../details/item-details.js"

export type PillsProps = {
  bins?: Iterable<PillsItemBin>
  BinProps?: Partial<PillBinProps>
  PillProps?: Partial<PillProps>
  renderBin?: (props: PillBinProps, bin: PillsItemBin) => ReactNode
  renderPill?: (props: PillProps, item: PillsItemType) => ReactNode
  titleComponent?: string
} & PillsRootProps

type PillsComponentType = NamedExoticComponent<PillsProps> & {
  Root: typeof PillsRoot
  Bin: typeof PillBin
  Pill: typeof Pill
}

const _Pills = memo((props: PillsProps) => {
  const {
    bins = [],
    titleComponent,
    BinProps,
    PillProps,
    renderBin,
    renderPill,
    ...other
  } = props

  const binEls = []

  if (renderBin) {
    for (const bin of bins) {
      binEls.push(renderBin({ titleComponent, ...BinProps }, bin))
    }
  } else {
    for (const bin of bins) {
      binEls.push(
        <ManagedBin
          key={bin.id}
          bin={bin}
          titleComponent={titleComponent}
          PillProps={PillProps}
          renderPill={renderPill}
          {...BinProps}
        />,
      )
    }
  }

  return <Pills.Root {...other}>{binEls}</Pills.Root>
}) as Partial<PillsComponentType>

_Pills.displayName = "Pills"

const ManagedBin = memo(
  (
    props: {
      bin: PillsItemBin
      PillProps?: Partial<PillProps>
      renderPill?: (props: PillProps, item: PillsItemType) => ReactNode
    } & PillBinProps,
  ) => {
    const { bin, PillProps, renderPill, ...other } = props

    const els = []

    if (renderPill) {
      for (const item of bin.items) {
        els.push(renderPill({ ...PillProps, children: item.title }, item))
      }
    } else {
      for (const item of bin.items) {
        els.push(
          <Pills.Pill key={item.id} {...PillProps}>
            {item.title}
          </Pills.Pill>,
        )
      }
    }

    return (
      <Pills.Bin title={bin.title} {...other}>
        {els}
      </Pills.Bin>
    )
  },
)

ManagedBin.displayName = "ManagedBin"

export type PillsRootProps = BoxProps & {
  children?: ReactNode
}

export const PillsRoot = (props: PillsRootProps) => {
  const { className, children, ...other } = useProps("Pills", {}, props)

  return (
    <Box className={clsx("Pills-root", className)} {...other}>
      {children}
    </Box>
  )
}

export type PillBinProps = {
  children?: ReactNode
  title?: ReactNode
  menu?: boolean
  titleComponent?: string
} & BoxProps

const PillBin = memo((props: PillBinProps) => {
  const {
    className,
    children,
    title,
    menu,
    titleComponent = "h3",
    ...other
  } = useProps("PillBin", {}, props)

  return (
    <Box
      component="section"
      className={clsx("PillBin-root", binClasses.root, className)}
      {...other}
    >
      {title ? (
        <>
          <Title
            component={titleComponent}
            order={3}
            className={clsx("PillBin-title", binClasses.title)}
          >
            {title}
          </Title>
          <Divider className={clsx("PillBin-divider", binClasses.divider)} />
        </>
      ) : null}
      <Box
        component={menu ? "menu" : "ul"}
        className={clsx("PillBin-pills", binClasses.pills)}
      >
        {children}
      </Box>
    </Box>
  )
})

PillBin.displayName = "PillBin"

export type PillProps = {
  classNames?: {
    root?: string
    button?: string
    body?: string
    indicator?: string
    hoverCardDropdown?: string
  }
  indicator?: ReactNode
  href?: string
  button?: boolean
  hasItemDetailsHoverCard?: boolean
  item?: ItemDetailsItemType
  ItemDetailsProps?:
    | Partial<ItemDetailsProps>
    | ((item: ItemDetailsItemType) => Partial<ItemDetailsProps>)
  children?: ReactNode
  onClick?: (e: MouseEvent) => void
} & BoxProps &
  ComponentPropsWithoutRef<"li">

const Pill = memo((props: PillProps) => {
  const {
    className,
    classNames,
    indicator,
    href,
    button,
    hasItemDetailsHoverCard,
    item,
    ItemDetailsProps,
    children,
    onClick,
    ...other
  } = useProps("Pill", {}, props)

  const [hoverEnabled, setHoverEnabled] = useState(false)

  const detailsProps = useMemo(() => {
    if (!hoverEnabled) {
      return
    }

    if (item && typeof ItemDetailsProps == "function") {
      return ItemDetailsProps(item)
    } else if (typeof ItemDetailsProps == "object") {
      return ItemDetailsProps
    }
  }, [hoverEnabled, ItemDetailsProps, item])

  const handleMouseEnter = useCallback(() => {
    setHoverEnabled(true)
  }, [])

  const inner = button ? (
    <Box
      component="button"
      className={clsx(
        "Pill-body",
        "Pill-button",
        pillClasses.body,
        pillClasses.button,
        classNames?.body,
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Box>
  ) : (
    <Box
      component="a"
      className={clsx("Pill-body", pillClasses.body, classNames?.body)}
      href={href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Box>
  )

  const withHover = hasItemDetailsHoverCard ? (
    <ItemHoverCard
      classNames={{
        dropdown: clsx("Pill-hoverCardDropdown", classNames?.hoverCardDropdown),
      }}
      item={hoverEnabled ? item : undefined}
      ItemDetailsProps={detailsProps}
    >
      {inner}
    </ItemHoverCard>
  ) : (
    inner
  )

  const wrapped = indicator ? (
    <Indicator
      label={indicator}
      className={clsx(
        "Pill-indicator",
        pillClasses.indicator,
        classNames?.indicator,
      )}
    >
      {withHover}
    </Indicator>
  ) : (
    withHover
  )

  return (
    <Box
      component="li"
      className={clsx(
        "Pill-root",
        pillClasses.root,
        classNames?.root,
        className,
        getTagClassNames(item?.tags ?? []),
      )}
      {...other}
    >
      {wrapped}
    </Box>
  )
})

Pill.displayName = "Pill"

const getTagClassNames = (tags: Iterable<string>): string => {
  return Array.from(tags, (tag) => `Pill-item-tag-${tag}`).join(" ")
}

_Pills.Root = PillsRoot
_Pills.Bin = PillBin
_Pills.Pill = Pill

export const Pills = _Pills as PillsComponentType
