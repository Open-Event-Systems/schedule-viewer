import type { Address } from "@open-event-systems/schedule-lib"

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
