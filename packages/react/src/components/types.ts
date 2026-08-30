import type { BoxProps } from "@mantine/core"
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

export type RenderRootFunc<E extends ElementType = "div"> = (
  props: ComponentPropsWithoutRef<E>,
) => ReactNode

export type DefaultBoxProps<E extends ElementType = "div"> = BoxProps &
  ComponentPropsWithoutRef<E> & {
    renderRoot?: RenderRootFunc<E>
  }
