import { Outlet } from "@tanstack/react-router"
import { useState } from "react"
import { FilterStateStoreContext, makeFilterStateStore } from "../filter.js"

export const FilterStateRoute = () => {
  const [state] = useState(() => makeFilterStateStore())
  return (
    <FilterStateStoreContext value={state}>
      <Outlet />
    </FilterStateStoreContext>
  )
}
