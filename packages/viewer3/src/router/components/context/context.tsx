import { useAppContext } from "#src/app.js"
import {
  BaseAppContextProvider,
  TagsConfigContext,
} from "@open-event-systems/schedule-react"
import { Outlet } from "@tanstack/react-router"

export const ContextRoute = () => {
  const ctx = useAppContext()
  const {
    config: { tags },
  } = ctx

  return (
    <BaseAppContextProvider value={ctx}>
      <TagsConfigContext.Provider value={tags}>
        <Outlet />
      </TagsConfigContext.Provider>
    </BaseAppContextProvider>
  )
}
