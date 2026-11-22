/**
 * SSR resource utils.
 * @module
 */

import type { JSX } from "react/jsx-runtime"
import type { Manifest, ManifestChunk } from "vite"

/**
 * Get the resources to load from the vite manifest.
 */
export const getManifestResources = <M extends Manifest>(
  manifest: M,
  basePath: string,
  entryPoint: keyof M,
): {
  scripts: JSX.IntrinsicElements["script"][]
  links: JSX.IntrinsicElements["link"][]
} => {
  const scripts: JSX.IntrinsicElements["script"][] = []
  const links: JSX.IntrinsicElements["link"][] = []

  const chunk = manifest[entryPoint]
  if (!chunk) {
    return { scripts, links }
  }

  scripts.push({
    type: "module",
    src: getScript(chunk, basePath),
  })

  const styles = new Set<string>()

  getStyles(manifest, chunk, basePath, new Set([entryPoint]), styles)

  for (const style of styles) {
    links.push({
      rel: "stylesheet",
      href: style,
    })
  }

  return { scripts, links }
}

const getScript = (chunk: ManifestChunk, basePath: string): string => `${basePath}${chunk.file}`

const getStyles = <M extends Manifest>(
  manifest: M,
  chunk: ManifestChunk,
  basePath: string,
  seen: Set<keyof M>,
  styles: Set<string>,
) => {
  for (const css of chunk.css ?? []) {
    styles.add(`${basePath}${css}`)
  }

  const imports = [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])]

  for (const imp of imports) {
    if (!seen.has(imp)) {
      seen.add(imp)
      const newChunk = manifest[imp as keyof M]
      if (newChunk) {
        getStyles(manifest, newChunk, basePath, seen, styles)
      }
    }
  }
}
