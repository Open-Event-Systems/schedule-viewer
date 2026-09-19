/**
 * SSR deserialization utilities.
 * @module
 */

import { makeTagsConfig, type TagConfig } from "#src/tags.js"
import { defaultHydrators as origDefaultHydrators } from "@open-event-systems/schedule-lib/serialization"

export const DATA_KEY = "__ULE_DATA"

export type HydratorFuncs<M> = Readonly<{
  [K in keyof M]: (value: unknown) => M[K]
}>

export type Hydrator<M, D extends Record<string, unknown>, K> = {
  (): D
} & Readonly<{
  key: K
  hydrators: HydratorFuncs<M>
}>

export const makeHydrator = <D extends Record<string, unknown>>(): (<
  M,
  K extends string = typeof DATA_KEY,
>(
  hydrators: HydratorFuncs<M>,
  opts?: {
    dataKey?: K
  },
) => Hydrator<M, D, K>) => {
  return <M, K extends string = typeof DATA_KEY>(
    hydrators: HydratorFuncs<M>,
    opts?: { dataKey?: K },
  ): Hydrator<M, D, K> => {
    const key = opts?.dataKey || DATA_KEY
    const hydrate = () => {
      const dataFuncKey = key as keyof typeof self
      const dataFunc = self[dataFuncKey]
      return dataFunc(hydrators)
    }
    hydrate.key = key as K
    hydrate.hydrators = hydrators
    return hydrate
  }
}

/**
 * Rehydrate dehydrated data on the client.
 */
export const rehydrate = <R>(
  rehydrators?: { readonly [key: string]: (data: unknown) => unknown } | null,
  opts?: {
    dataKey?: string
  },
): R => {
  if (!rehydrators) {
    rehydrators = defaultHydrators
  }

  const { dataKey } = opts ?? {}
  const finalKey = (dataKey ?? DATA_KEY) as keyof typeof self
  const func = self[finalKey]
  if (func) {
    return func(rehydrators)
  }

  return undefined as R
}

export const defaultHydrators = {
  ...origDefaultHydrators,
  tagsConfig: (value: unknown) =>
    makeTagsConfig({ tags: value as Record<string, TagConfig> }),
} as const
