/**
 * App context utilities.
 * @module
 */

import { createContext, use } from "react"
import type { JSX } from "react/jsx-runtime"

export type OriginString = `http://${string}` | `https://${string}`
export type BasePathString = `/${string}/` | "/"
export type AppType = "spa" | "ssr"

/**
 * Basic info to be used everywhere in the application.
 */
export type BaseAppContext = Readonly<{
  /**
   * The app type (SPA vs SSR).
   *
   * This is the same on both server and client, i.e. it is not the same as
   * `import.meta.env.SSR`.
   */
  appType: AppType

  /**
   * The web page origin.
   */
  origin: OriginString

  /**
   * The base path.
   *
   * Must start and end in a slash.
   */
  basePath: BasePathString

  /**
   * Meta tags to include in the document head.
   */
  meta: readonly JSX.IntrinsicElements["meta"][]

  /**
   * Scripts to include in the document head.
   */
  scripts: readonly JSX.IntrinsicElements["script"][]

  /**
   * Links to include in the document head.
   */
  links: readonly JSX.IntrinsicElements["link"][]

  /**
   * Get a path with the base path prepended.
   */
  getPath: (path: string) => string

  /**
   * Get the full URL to a path relative to the base.
   */
  getURL: (path: string) => string
}>

/**
 * Make an app context object.
 */
export const makeAppContext = <E extends Record<string, unknown>>(
  ctx: Omit<Partial<BaseAppContext>, "getPath" | "getURL"> & E,
): BaseAppContext & E => {
  const newObj = {
    ...ctx,
    appType: ctx?.appType || "spa",
    origin: ctx?.origin || "http://localhost:5173",
    basePath: ctx?.basePath ?? "/",
    meta: [...(ctx?.meta ?? [])],
    scripts: [...(ctx?.scripts ?? [])],
    links: [...(ctx?.links ?? [])],
  }

  const getPath = (path: string) => {
    if (path.startsWith("/")) {
      path = path.slice(1)
    }
    return newObj.basePath + path
  }

  const getURL = (path: string) => {
    return newObj.origin + getPath(path)
  }

  return {
    ...newObj,
    getPath,
    getURL,
  }
}

export type AwaitedAppContext<C extends BaseAppContext> = {
  [K in keyof C]: Awaited<C[K]>
}

/**
 * Await all properties in ctx.
 */
export const awaitAppContext = async <C extends BaseAppContext>(
  ctx: C,
): Promise<AwaitedAppContext<C>> => {
  const resObj = {} as Record<keyof C, C[keyof C]>

  const promises = Object.entries(ctx).map(async ([k, a]) => {
    const key = k as keyof C
    const awaitable = a as C[keyof C] | Promise<C[keyof C]>
    const value = await awaitable
    resObj[key] = value
  })

  await Promise.all(promises)

  return resObj as AwaitedAppContext<C>
}

const baseAppContext = createContext<BaseAppContext>(makeAppContext({}))

export const BaseAppContextProvider = baseAppContext.Provider
export const useBaseAppContext = (): BaseAppContext => use(baseAppContext)
