/**
 * SSR deserialization utilities.
 * @module
 */

import { defaultRehydrators } from "@open-event-systems/schedule-lib/serialization"

export const DATA_KEY = "__ULE_DATA"

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
    rehydrators = defaultRehydrators
  }

  const { dataKey } = opts ?? {}
  const finalKey = (dataKey ?? DATA_KEY) as keyof typeof self
  const func = self[finalKey]
  if (func) {
    return func(rehydrators)
  }

  return undefined as R
}
