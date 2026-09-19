import { useBaseAppContext } from "#src/app-context.js"
import type { Address } from "@open-event-systems/schedule-lib"
import {
  createContext,
  use,
  useLayoutEffect,
  useState,
  type Context,
  type ReactNode,
} from "react"
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
export const createOptionalContext = <T,>(
  initialValue?: T,
): Context<T | undefined> => createContext(initialValue)

/**
 * Wrap a provider of an optional context to be required.
 */
export const makeRequiredContextProvider = <T,>(
  Provider: (props: {
    value: T | undefined
    children?: ReactNode
  }) => ReactNode,
): ((props: { value: T; children?: ReactNode }) => ReactNode) => {
  const RequiredContextProvider = ({
    value,
    children,
  }: {
    value: T
    children?: ReactNode
  }) => {
    return <Provider value={value}>{children}</Provider>
  }
  return RequiredContextProvider
}

/**
 * Use a {@link Context}, throwing an error if the value is undefined.
 */
export const useRequiredContext = <T,>(context: Context<T | undefined>): T => {
  const ctx = use(context)
  if (ctx === undefined) {
    throw new Error(`${context.displayName || "Required context"} not provided`)
  }
  return ctx
}

/**
 * Compose two context providers.
 */
export const wrapContextProvider = <B, C extends B>(
  C: (props: { value: C; children?: ReactNode }) => ReactNode,
  B: (props: { value: B; children?: ReactNode }) => ReactNode,
): ((props: { value: C; children: ReactNode }) => ReactNode) => {
  const WrappedProvider = ({
    value,
    children,
  }: {
    value: C
    children: ReactNode
  }) => {
    return (
      <C value={value}>
        <B value={value}>{children}</B>
      </C>
    )
  }

  return WrappedProvider
}

/**
 * Return a {@link useStore} hook for a specific store.
 */
export const makeUseBoundStore = <T,>(
  store: StoreApi<T> | (() => StoreApi<T>),
): UseBoundStore<StoreApi<T>> => {
  return ((selector) => {
    if (typeof store == "function") {
      store = store()
    }

    return useStore(store, selector)
  }) as UseBoundStore<StoreApi<T>>
}

/**
 * Hook to return whether the app is in SSR mode.
 */
export const useIsSSR = (): boolean => {
  const ctx = useBaseAppContext()
  return ctx.appType == "ssr"
}

/**
 * Use a default initial value during SSR rendering and hydration.
 */
export const useSSRValue = <V, D>(value: V, ssrValue: D): V | D => {
  const [ssr, setSSR] = useState(useIsSSR())

  useLayoutEffect(() => {
    setSSR(false)
  }, [])

  return ssr ? ssrValue : value
}
