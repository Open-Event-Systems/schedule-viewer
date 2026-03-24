import { PageMenu } from "../components/page-menu/page-menu.js"
import { useViewerConfig } from "../config.js"
import { pagesRoute } from "../routes.js"
import { Page } from "../components/page/page.js"
import { Markdown, useItems } from "@open-event-systems/schedule-react"
import { parsers } from "../schedule.js"
import { useCallback, useMemo } from "react"
import { useRouter } from "@tanstack/react-router"
import { useMediaQuery } from "@mantine/hooks"

import { makeScheduleItemCollection } from "@open-event-systems/schedule-lib"

import classes from "./pages.module.scss"
import { combineScheduleItems } from "../utils.js"

export const PagesRoute = () => {
  const { pageId } = pagesRoute.useParams()
  const { pageConfig, getCurrentURL } = pagesRoute.useRouteContext()
  const config = useViewerConfig()
  const router = useRouter()

  const navigate = pagesRoute.useNavigate()

  const {
    byType: { event: events, vendor: vendors },
  } = useItems(parsers)
  const combinedItems = useMemo(() => {
    return makeScheduleItemCollection(combineScheduleItems(events, vendors))
  }, [events, vendors])

  const defaultPageId = config.pages[0]?.id

  const onSelectPage = useCallback(
    (id: string) => {
      navigate({
        to: pagesRoute.to,
        params: {
          pageId: id,
        },
        state: (prev) => prev,
        from: pagesRoute.to,
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
            to: pagesRoute.to,
            params: {
              pageId: id,
            },
          }).href,
        )
      )
    },
    [router.origin, router],
  )

  const isSmall = useMediaQuery("(max-width: 768px)")

  return (
    <>
      <Markdown className={classes.description}>{config.description}</Markdown>
      <PageMenu
        variant={!isSmall && config.pages.length > 1 ? "tabs" : "select"}
        pages={config.pages}
        selectedPage={pageId || defaultPageId}
        onSelectPage={onSelectPage}
        renderPage={() => (
          <Page
            key={pageId || defaultPageId}
            items={combinedItems}
            pageConfig={pageConfig}
            origin={origin}
            currentURL={getCurrentURL()}
          />
        )}
        getPageURL={getPageURL}
      />
    </>
  )
}
