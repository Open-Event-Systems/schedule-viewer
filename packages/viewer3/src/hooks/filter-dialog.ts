/**
 * Filter state controlled by the filter dialog.
 * @module
 */

import { useLocation, useNavigate, useRouter } from "@tanstack/react-router"
import { useCallback, useEffect, useRef } from "react"

declare module "@tanstack/react-router" {
  interface HistoryState {
    filterDialogOpen?: true
  }
}

export const useFilterDialogOpenState = (): [
  boolean,
  (open: boolean) => void,
] => {
  const navigate = useNavigate()
  const router = useRouter()
  const setState = useCallback(
    (open: boolean) => {
      if (open) {
        navigate({
          to: ".",
          state: (prev) => ({ ...prev, filterDialogOpen: true }),
          search: true,
          hash: true,
        })
      } else {
        router.history.go(-1)
      }
    },
    [navigate, router],
  )

  const state = useLocation({ select: ({ state }) => !!state.filterDialogOpen })

  return [state, setState]
}

export const useThrottledSetSearch = (
  enabled: boolean,
  search: string | undefined,
  setSearch: (search: string) => void,
) => {
  const prevValue = useRef(search)

  useEffect(() => {
    if (search != prevValue.current) {
      if (enabled) {
        const timeout = window.setTimeout(() => setSearch(search || ""), 300)
        prevValue.current = search
        return () => window.clearTimeout(timeout)
      } else {
        prevValue.current = search
      }
    }
  }, [enabled, search, setSearch])
}
