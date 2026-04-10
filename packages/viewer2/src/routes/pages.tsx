import { PageMenu } from "../components/page-menu/page-menu.js"
import { useViewerConfig } from "../config.js"
import { pagesRoute } from "../routes.js"
import { Markdown, useItems } from "@open-event-systems/schedule-react"
import { parsers } from "../schedule.js"
import { useCallback, useMemo } from "react"
import { useNavigate, useParams, useRouter } from "@tanstack/react-router"
import { useMediaQuery } from "@mantine/hooks"

import { Page } from "../components/page/page.js"

import classes from "./pages.module.scss"

export const PagesRoute = () => {
  const { pageId } = useParams({
    strict: false,
  })

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
    [router],
  )

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
          <Page items={eventsAndVendors} pageConfig={pageConfig} />
        )}
        getPageURL={getPageURL}
      />
    </>
  )
}
