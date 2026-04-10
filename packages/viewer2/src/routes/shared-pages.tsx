import { PageMenu } from "../components/page-menu/page-menu.js"
import { useViewerConfig } from "../config.js"
import { sharedPagesRoute } from "../routes.js"
import {
  Markdown,
  useItems,
  useSelections,
} from "@open-event-systems/schedule-react"
import { parsers } from "../schedule.js"
import { useCallback, useMemo } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useMediaQuery } from "@mantine/hooks"

import classes from "./pages.module.scss"
import { Page } from "../components/page/page.js"

const SharedPagesRoute = () => {
  const { shareId, pageId } = sharedPagesRoute.useParams()

  const config = useViewerConfig()
  const router = useRouter()

  const navigate = useNavigate()

  const { items } = useItems(parsers)
  const eventsAndVendors = useMemo(
    () => items.filter((t) => t.type == "event" || t.type == "vendor"),
    [items],
  )

  const onSelectPage = useCallback(
    (id: string) => {
      navigate({
        to: sharedPagesRoute.to,
        params: {
          shareId,
          pageId: id,
        },
        state: true,
        from: sharedPagesRoute.to,
      })
    },
    [navigate],
  )

  const getPageURL = useCallback(
    (id: string) => {
      return (
        router.origin +
        router.history.createHref(
          router.buildLocation({
            to: sharedPagesRoute.to,
            params: {
              shareId,
              pageId: id,
            },
          }).href,
        )
      )
    },
    [router],
  )

  const sharedSelectionsQuery = useSelections(shareId)

  const isSmall = useMediaQuery("(max-width: 768px)")

  return (
    <>
      <Markdown className={classes.description}>{config.description}</Markdown>
      <PageMenu
        variant={!isSmall && config.pages.length > 1 ? "tabs" : "select"}
        pages={config.pages}
        selectedPage={pageId}
        onSelectPage={onSelectPage}
        renderPage={(pageConfig) => (
          <Page
            items={eventsAndVendors}
            pageConfig={pageConfig}
            sharedSelections={sharedSelectionsQuery.data ?? undefined}
          />
        )}
        getPageURL={getPageURL}
      />
    </>
  )
}

export default SharedPagesRoute
