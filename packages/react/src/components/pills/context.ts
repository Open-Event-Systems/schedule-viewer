import { createContext, useContext } from "react"
import type { PillsItemType } from "./bin.js"
import type { PillProps } from "./pills.js"

export type GetPillPropsFunc = (
  item: PillsItemType,
) => Readonly<Partial<PillProps>>
export const PillPropsContext = createContext<GetPillPropsFunc>(() => ({}))
export const usePillPropsFunc = (): GetPillPropsFunc =>
  useContext(PillPropsContext)
