import { Outlet } from "@tanstack/react-router"
import { useState } from "react"
import { FilterStateAtomContext, makeFilterStateAtom } from "../filter.js"

export const FilterStateRoute = () => {
  const [atom] = useState(() => makeFilterStateAtom())
  return (
    <FilterStateAtomContext value={atom}>
      <Outlet />
    </FilterStateAtomContext>
  )
}
