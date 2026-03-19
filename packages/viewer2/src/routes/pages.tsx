import { PageMenu } from "../components/page-menu/page-menu.js"
import { useViewerConfig } from "../config.js"
import { pagesRoute } from "../routes.js"
import { Page } from "../components/page/page.js"
import { Markdown, useItems } from "@open-event-systems/schedule-react"
import { parsers } from "../schedule.js"
import { useMemo } from "react"
import { useRouter } from "@tanstack/react-router"
import { useMediaQuery } from "@mantine/hooks"

import { makeScheduleItemCollection } from "@open-event-systems/schedule-lib"

import classes from "./pages.module.scss"

export const PagesRoute = () => {
  const { pageId } = pagesRoute.useParams()
  const { pageConfig } = pagesRoute.useRouteContext()
  const config = useViewerConfig()
  const router = useRouter()

  const navigate = pagesRoute.useNavigate()

  const {
    byType: { event: events, vendor: vendors },
  } = useItems(parsers)
  const combinedItems = useMemo(() => {
    function* combine() {
      const stores = [events, vendors]
      for (const store of stores) {
        for (const item of store) {
          yield item
        }
      }
    }

    return makeScheduleItemCollection(combine())
  }, [events, vendors])

  const defaultPageId = config.pages[0]?.id

  const onSelectPage = (id: string) => {
    navigate({
      to: pagesRoute.to,
      params: {
        pageId: id,
      },
      state: (prev) => prev,
      from: pagesRoute.to,
    })
  }

  const getPageURL = (id: string) => {
    return (
      window.origin +
      router.history.createHref(
        router.buildLocation({
          to: pagesRoute.to,
          params: {
            pageId: id,
          },
        }).href,
      )
    )
  }

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
          />
        )}
        getPageURL={getPageURL}
      />
    </>
  )
}
