import type { Address } from "@open-event-systems/schedule-lib"
import { createContext, use, type Context } from "react"
import { useStore, type StoreApi, type UseBoundStore } from "zustand"

/**
 * Format an {@link Address} to a string.
 */
export const formatAddress = (address: Address): string => {
  const region = [address.addressRegion, address.postalCode]
    .filter((v) => !!v)
    .join(" ")

  const parts = [
    address.postOfficeBoxNumber || address.streetAddress,
    address.addressLocality,
    region,
  ].filter((v) => !!v)

  return parts.join(", ")
}

/**
 * Create a {@link Context} that supports having no initial value.
 */
export const createOptionalContext = <T>(
  initialValue?: T,
): Context<T | undefined> => createContext(initialValue)

/**
 * Use a {@link Context}, throwing an error if the value is undefined.
 */
export const useRequiredContext = <T>(context: Context<T | undefined>): T => {
  const ctx = use(context)
  if (ctx === undefined) {
    throw new Error(`${context.displayName || "Required context"} not provided`)
  }
  return ctx
}

/**
 * Return a {@link useStore} hook for a specific store.
 */
export const makeUseBoundStore = <T>(
  store: StoreApi<T> | (() => StoreApi<T>),
): UseBoundStore<StoreApi<T>> => {
  return ((selector) => {
    if (typeof store == "function") {
      store = store()
    }

    return useStore(store, selector)
  }) as UseBoundStore<StoreApi<T>>
}
