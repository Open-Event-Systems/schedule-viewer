import type { PillProps } from "@mantine/core"
import { createContext, useContext, type MouseEvent } from "react"
import type { PillsItemType } from "../components/pills/bin.js"

export type GetPillPropsFunc = (
  item: PillsItemType,
) => Readonly<
  Partial<Omit<PillProps, "onClick"> & { onClick?: (e: MouseEvent) => void }>
>
export const PillPropsContext = createContext<GetPillPropsFunc>(() => ({}))
export const usePillPropsFunc = (): GetPillPropsFunc =>
  useContext(PillPropsContext)
