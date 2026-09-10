import type { JSX } from "react/jsx-runtime"
import type { Manifest } from "vite"



export const getManifestResources = (
  manifest: Manifest,
  basePath: string,
  entryPoint: string,
): {
  scripts: JSX.IntrinsicElements["script"][]
  links: JSX.IntrinsicElements["link"][]
} => {
  const scripts: JSX.IntrinsicElements["script"][] = []
  const links: JSX.IntrinsicElements["link"][] = []

  const chunkInfo = manifest[entryPoint]
  if (!chunkInfo) {
    return { scripts, links }
  }

  scripts.push({
    type: "module",
    src: `${basePath}${chunkInfo.file}`
  })

  getStyles(links, manifest, basePath, entryPoint)

  return { scripts, links }
}

const getStyles = (
  links: JSX.IntrinsicElements["link"][],
  manifest: Manifest,
  basePath: string,
  chunk: string,
) => {
  const chunkInfo = manifest[chunk]
  for (const css of chunkInfo?.css ?? []) {
    links.push({
      rel: "stylesheet",
      href: `${basePath}${css}`,
    })
  }

  for (const imp of chunkInfo?.imports ?? []) {
    getStyles(links, manifest, basePath, imp)
  }
}
