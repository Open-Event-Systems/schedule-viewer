import type { BoxProps } from "@mantine/core"
import type { AllHTMLAttributes, ReactNode } from "react"

export type RenderRootFunc<E extends HTMLElement = HTMLElement> = (
  props: AllHTMLAttributes<E>,
) => ReactNode

export type DefaultBoxProps<E extends HTMLElement = HTMLElement> = BoxProps &
  AllHTMLAttributes<E> & {
    renderRoot?: RenderRootFunc<E>
  }
