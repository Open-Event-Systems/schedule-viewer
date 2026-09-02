import type { BoxProps } from "@mantine/core"
import type { AllHTMLAttributes, ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

export type RenderRootFunc = (
  props: AllHTMLAttributes<HTMLElement>,
) => ReactNode

export type DefaultBoxProps<E extends ElementType = "div"> = BoxProps &
  ComponentPropsWithoutRef<E> & {
    renderRoot?: RenderRootFunc
  }
