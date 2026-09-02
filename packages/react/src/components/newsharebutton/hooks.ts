import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

/**
 * Return whether the given data can be shared via the Web Share API.
 */
export const useCanShare = (data?: ShareData | null): boolean =>
  useMemo(
    () =>
      !!data &&
      getSupportsShare() &&
      (!getSupportsCanShare() || navigator.canShare(data)),
    [data],
  )

/**
 * Share the given data via the Web Share API.
 * @returns A promise, or undefined if not supported.
 */
export const share = (data: ShareData): Promise<void> | undefined => {
  if (!getSupportsShare() || (getSupportsCanShare() && !navigator.canShare(data))) {
    return
  }

  return navigator.share(data)
}

/**
 * Copy the text to the clipboard.
 * @returns A promise, or undefined if not supported.
 */
export const copyText = (text: string): Promise<void> | undefined => {
  if (!getSupportsClipboard()) {
    return
  }

  return navigator.clipboard.writeText(text)
}


export type UseDownloadOptions = Readonly<{
  data: string | Blob
  type?: string | null
  filename?: string | null
}>

/**
 * Download data as a file.
 */
export const download = (
  opts: UseDownloadOptions
) => {
  let asBlob

  if (typeof opts.data == "string") {
    asBlob = new Blob(
      [opts.data],
      opts.type ? { type: opts.type } : undefined,
    )
  } else {
    asBlob = opts.data
  }

  const url = URL.createObjectURL(asBlob)
  const el = document.createElement("a")
  el.style.display = "none"
  el.href = url

  if (opts.filename) {
    el.download = opts.filename
  }

  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)

  URL.revokeObjectURL(url)
  return
}

/**
 * Share a URL using either the Web Share API or clipboard.
 * @returns A promise describing how it was shared, or undefined if unsupported.
 */
export const shareURL = (url: string, title?: string | null): Promise<"shared" | "copied"> | undefined => {
  const shareData: ShareData = {
    url,
  }

  if (title) {
    shareData.title = title
  }

  const shareRes = share(shareData)
  if (shareRes) {
    return shareRes.then(() => "shared" as const)
  }

  const copyRes = copyText(url)
  if (copyRes) {
    return copyRes.then(() => "copied" as const)
  }
}

/**
 * Hook to show a tooltip.
 */
export const useTooltip = (): {
  tooltipOpened: boolean
  tooltipLabel?: ReactNode
  showTooltip: (message: ReactNode, timeout?: number) => void,
} => {
  const [tooltipOpened, setTooltipOpened] = useState(() => false)
  const [tooltipLabel, setTooltipLabel] = useState<ReactNode>(() => undefined)

  const curTimeout = useRef<number | null>(null)

  const showTooltip = useCallback((message: ReactNode, timeout = 750) => {
    if (curTimeout.current) {
      window.clearTimeout(curTimeout.current)
    }

    setTooltipLabel(message)
    setTooltipOpened(true)

    curTimeout.current = window.setTimeout(() => {
      setTooltipOpened(false)
      curTimeout.current = null
    }, timeout)

  }, [curTimeout, setTooltipOpened, setTooltipLabel])

  useEffect(() => {
    return () => {
      if (curTimeout.current != null) {
        window.clearTimeout(curTimeout.current)
      }
    }
  }, [curTimeout])

  return {
    tooltipOpened,
    tooltipLabel,
    showTooltip,
  }
}

export const getSupportsShare = (): boolean =>
  typeof navigator != "undefined" &&
  "share" in navigator &&
  "canShare" in navigator
export const getSupportsCanShare = (): boolean =>
  typeof navigator != "undefined" && "canShare" in navigator
export const getSupportsClipboard = (): boolean =>
  typeof navigator != "undefined" && "clipboard" in navigator
