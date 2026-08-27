import type { BoxProps } from "@mantine/core"
import type { AllHTMLAttributes, ReactNode } from "react"

export type RenderRootFunc = (props: AllHTMLAttributes<HTMLElement>) => ReactNode

export type DefaultBoxProps = BoxProps & AllHTMLAttributes<HTMLElement> & {
  renderRoot?: RenderRootFunc
}