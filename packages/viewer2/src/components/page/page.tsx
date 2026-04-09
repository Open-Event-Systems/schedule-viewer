import { type DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import { type PageConfig } from "../../config.js"
import { Box, useProps } from "@mantine/core"
import {
  Markdown,
  ShareDialog,
  useSelectionsServiceAPI,
} from "@open-event-systems/schedule-react"
import { SchedulePageContainer } from "../schedule/schedule-page.js"
import clsx from "clsx"

import classes from "./page.module.scss"
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router"
import { useMemo, useRef } from "react"
import { sharedPagesRoute, syncRoute } from "../../routes.js"

declare module "@tanstack/react-router" {
  interface HistoryState {
    shareDialogId?: string
    syncDialogId?: string
  }
}

export type PageProps = {
  pageConfig: PageConfig
  items?: Iterable<DetailedScheduleItem>
  sharedSelections?: Iterable<string>
}

/**
 * Displays a schedule page.
 */
export const Page = (props: PageProps) => {
  const { pageConfig, items, sharedSelections } = useProps("Page", {}, props)
  const navigate = useNavigate()
  const selectionsServiceAPI = useSelectionsServiceAPI()

  return (
    <Box className={clsx("Page-root", classes.root)}>
      <Markdown className={clsx("Page-description", classes.description)}>
        {pageConfig.description}
      </Markdown>
      <SchedulePageContainer
        pageConfig={pageConfig}
        items={items}
        sharedSelections={sharedSelections}
        onSelectShareOption={(option) => {
          if (option == "share") {
            selectionsServiceAPI
              ?.getSessionSelections("bookmarks")
              .then((ssel) => {
                navigate({
                  to: ".",
                  state: (prev) => ({ ...prev, shareDialogId: ssel.id }),
                  params: true,
                  search: true,
                  hash: true,
                })
              })
          } else if (option == "sync") {
            const token = selectionsServiceAPI?.sessionToken
            if (token) {
              navigate({
                to: ".",
                state: (prev) => ({
                  ...prev,
                  syncDialogId: token,
                }),
                params: true,
                search: true,
                hash: true,
              })
            }
          }
        }}
      />
      <ShareDialogContainer />
      <SyncDialogContainer />
    </Box>
  )
}

const ShareDialogContainer = () => {
  const shareId = useLocation({
    select: (loc) => loc.state.shareDialogId,
  })

  const router = useRouter()

  const shareIdRef = useRef(shareId)

  const curShareId = shareId ?? shareIdRef.current

  if (shareId) {
    shareIdRef.current = curShareId
  }

  const shareURL = useMemo(
    () =>
      router.origin +
      router.history.createHref(
        router.buildLocation({
          to: sharedPagesRoute.to,
          params: {
            shareId: shareId ?? "",
          },
        }).href,
      ),
    [router, shareId],
  )

  return (
    <ShareDialog
      type="share"
      opened={!!shareId}
      shareURL={shareURL}
      onClose={() => router.history.go(-1)}
    />
  )
}

const SyncDialogContainer = () => {
  const sessionToken = useLocation({
    select: (loc) => loc.state.syncDialogId,
  })

  const router = useRouter()

  const tokenRef = useRef(sessionToken)

  const curShareId = sessionToken ?? tokenRef.current

  if (sessionToken) {
    tokenRef.current = curShareId
  }

  const shareURL = useMemo(() => {
    const urlParams = new URLSearchParams()
    urlParams.set("sync", sessionToken ?? "")

    return (
      router.origin +
      router.history.createHref(
        router.buildLocation({
          to: syncRoute.to,
          hash: String(urlParams),
        }).href,
      )
    )
  }, [router, sessionToken])

  return (
    <ShareDialog
      type="sync"
      opened={!!sessionToken}
      shareURL={shareURL}
      onClose={() => router.history.go(-1)}
    />
  )
}
