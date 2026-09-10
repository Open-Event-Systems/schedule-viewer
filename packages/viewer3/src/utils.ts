import { useStore, type StoreApi, type UseBoundStore } from "zustand"

/**
 * Make a {@link useStore} function for a specific store (e.g. one gotten via context).
 */
export const makeBoundedUseStore = <T>(
  getStore: () => StoreApi<T>,
): UseBoundStore<StoreApi<T>> =>
  ((selector) => {
    const store = getStore()
    return useStore(store, selector)
  }) as UseBoundStore<StoreApi<T>>
