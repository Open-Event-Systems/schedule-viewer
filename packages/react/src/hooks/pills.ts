import { createContext, useContext } from "react"
import type { PillsItemType } from "../components/pills/bin.js"
import type { PillProps } from "../components/index.js"

export type GetPillPropsFunc = (
  item: PillsItemType,
) => Readonly<Partial<PillProps>>
export const PillPropsContext = createContext<GetPillPropsFunc>(() => ({}))
export const usePillPropsFunc = (): GetPillPropsFunc =>
  useContext(PillPropsContext)
