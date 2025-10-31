import {
  Box,
  type BoxProps,
  Divider,
  Indicator,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import { useMemo, type MouseEvent, type ReactNode } from "react"
import type { PillsItemBin, PillsItemType } from "./bin.js"
import { usePillPropsFunc } from "./context.js"

export type PillsProps = {
  bins?: Iterable<PillsItemBin>
  titleComponent?: string
} & PillsRootProps

export const Pills = (props: PillsProps) => {
  const { bins = [], titleComponent, ...other } = props

  const binEls = []

  for (const bin of bins) {
    binEls.push(
      <ManagedBin key={bin.id} bin={bin} titleComponent={titleComponent} />,
    )
  }

  return <Pills.Root {...other}>{binEls}</Pills.Root>
}

const ManagedBin = (
  props: {
    bin: PillsItemBin
  } & PillBinProps,
) => {
  const { bin, ...other } = props

  const els = []

  for (const item of bin.items) {
    els.push(<ManagedPill key={item.id} item={item} />)
  }

  return (
    <Pills.Bin title={bin.title} {...other}>
      {els}
    </Pills.Bin>
  )
}

const ManagedPill = (
  props: {
    item: PillsItemType
  } & PillProps,
) => {
  const { item, ...other } = props

  const propsFunc = usePillPropsFunc()
  const otherProps = useMemo(() => {
    return propsFunc(item)
  }, [propsFunc, item])

  return (
    <Pills.Pill {...otherProps} {...other}>
      {item.title}
    </Pills.Pill>
  )
}

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

const PillBin = (props: PillBinProps) => {
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
      className={clsx("PillBin-root", className)}
      {...other}
    >
      {title ? (
        <>
          <Title component={titleComponent} order={3} className="PillBin-title">
            {title}
          </Title>
          <Divider className="PillBin-divider" />
        </>
      ) : null}
      <Box component={menu ? "menu" : "ul"} className="PillBin-pills">
        {children}
      </Box>
    </Box>
  )
}

export type PillProps = {
  indicator?: ReactNode
  href?: string
  button?: boolean
  children?: ReactNode
  renderContent?: (children: ReactNode) => ReactNode
  onClick?: (e: MouseEvent) => void
} & BoxProps

const Pill = (props: PillProps) => {
  const {
    className,
    indicator,
    href,
    button,
    children,
    renderContent = (c: ReactNode) => c,
    onClick,
    ...other
  } = useProps("Pill", {}, props)

  let inner: ReactNode = button ? (
    <Box component="button" className="Pill-body Pill-button" onClick={onClick}>
      {children}
    </Box>
  ) : (
    <Box component="a" className="Pill-body" href={href} onClick={onClick}>
      {children}
    </Box>
  )

  inner = renderContent(inner)

  const wrapped = indicator ? (
    <Indicator label={indicator} className="Pill-indicator">
      {inner}
    </Indicator>
  ) : (
    inner
  )

  return (
    <Box component="li" className={clsx("Pill-root", className)} {...other}>
      {wrapped}
    </Box>
  )
}

Pills.Root = PillsRoot
Pills.Bin = PillBin
Pills.Pill = Pill
