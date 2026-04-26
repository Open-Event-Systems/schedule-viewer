import { PageMenu } from "../components/page-menu/page-menu.js"
import { useViewerConfig } from "../config.js"
import { eventDetailsRoute, pagesRoute, vendorDetailsRoute } from "../routes.js"
import { Markdown, useItems } from "@open-event-systems/schedule-react"
import { parsers } from "../schedule.js"
import { useCallback, useMemo } from "react"
import { useNavigate, useParams, useRouter } from "@tanstack/react-router"
import { useMediaQuery } from "@mantine/hooks"

import { Page } from "../components/page/page.js"

import classes from "./pages.module.scss"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import { JSONLDItems } from "../components/ld/ld.js"

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

  const getItemURL = useGetItemURLFunc(eventsAndVendors)

  const isSmall = useMediaQuery("(max-width: 768px)")

  return (
    <>
      <JSONLDItems getItemURL={getItemURL} items={eventsAndVendors} />
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

const useGetItemURLFunc = (items?: Iterable<DetailedScheduleItem>) => {
  const router = useRouter()

  const itemURLs = useMemo(() => {
    const map = new Map<string, string>()

    for (const item of items ?? []) {
      let url
      if (item.type == "event") {
        url =
          router.origin +
          router.history.createHref(
            router.buildLocation({
              to: eventDetailsRoute.to,
              params: {
                eventId: item.id,
              },
            }).href,
          )
      } else if (item.type == "vendor") {
        url =
          router.origin +
          router.history.createHref(
            router.buildLocation({
              to: vendorDetailsRoute.to,
              params: {
                vendorId: item.id,
              },
            }).href,
          )
      }

      if (url) {
        map.set(item.id, url)
      }
    }
    return map
  }, [items, router])

  return useCallback(
    (item: DetailedScheduleItem) => {
      return itemURLs.get(item.id) ?? ""
    },
    [itemURLs],
  )
}
