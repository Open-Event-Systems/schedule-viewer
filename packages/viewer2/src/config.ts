/**
 * Viewer configuration.
 */

import {
  DEFAULT_SCHEDULE_CONFIG,
  parseConfig,
  type ScheduleConfigInput,
  type SchedulePageFeature,
} from "@open-event-systems/schedule-react"
import z from "zod"
import wretch from "wretch"
import { createContext, use } from "react"
import { parseMapConfig } from "@open-event-systems/schedule-map"
import {
  type LocationAddressEntry,
  type PageConfig,
  type ScheduleViewComponentType,
  type ViewConfig,
  type ViewerConfig,
} from "./types.js"
import { optional } from "@open-event-systems/schedule-lib"

const viewConfigSchema = z.codec(
  z.looseObject({
    id: z.string(),
    type: z.string().refine((_s): _s is ScheduleViewComponentType => true),
    title: z.string(),
    enableFeatures: optional(
      z.array(z.string().refine((_s): _s is SchedulePageFeature => true)),
    ),
    showPastEvents: optional(z.boolean()),
    onlyBookmarked: optional(z.boolean()),
    onlyUnvisited: optional(z.boolean()),
  }),
  z.custom<ViewConfig>(),
  {
    decode: (v) => ({
      ...v,
    }),
    encode: ({ enableFeatures, ...v }) => ({
      ...v,
      ...(enableFeatures ? { enableFeatures: [...enableFeatures] } : null),
    }),
  },
)

const pageConfigSchema = z.codec(
  z.looseObject({
    id: z.string(),
    title: optional(z.string()),
    description: optional(z.string()),
    views: optional(z.array(viewConfigSchema)),
    onlyType: optional(
      z.codec(z.union([z.string(), z.array(z.string())]), z.array(z.string()), {
        decode: (v) => {
          if (Array.isArray(v)) {
            return v
          } else {
            return [v]
          }
        },
        encode: (v) => (v.length == 1 ? v[0]! : v),
      }),
    ),
    requireTags: optional(z.array(z.string())),
    excludeTags: optional(z.array(z.string())),
  }),
  z.custom<PageConfig>(),
  {
    decode: ({ views, ...v }) => ({ ...v, views: views ?? [] }),
    encode: ({ views, onlyType, requireTags, excludeTags, ...v }) => ({
      ...v,
      views: [...views],
      ...(onlyType ? { onlyType: [...onlyType] } : null),
      ...(requireTags ? { requireTags: [...requireTags] } : null),
      ...(excludeTags ? { excludeTags: [...excludeTags] } : null),
    }),
  },
)

const addressSchema = z.looseObject({
  address: optional(z.string()),
  address2: optional(z.string()),
  city: optional(z.string()),
  state: optional(z.string()),
  postal: optional(z.string()),
  country: optional(z.string()),
})

const locationAddressEntrySchema = z.codec(
  z.union([
    z.tuple([z.union([z.string(), z.array(z.string())]), addressSchema]),
    z.looseObject({
      location: z.union([z.string(), z.array(z.string())]),
      address: addressSchema,
    }),
  ]),
  z.custom<LocationAddressEntry>(),
  {
    decode: (v) => {
      if (Array.isArray(v)) {
        const [locs, addr] = v
        const locsArr = Array.isArray(locs) ? locs : [locs]
        return {
          location: locsArr,
          address: addr,
        }
      } else {
        const locsArr = Array.isArray(v.location) ? v.location : [v.location]
        return {
          location: locsArr,
          address: v.address,
        }
      }
    },
    encode: ({ location, ...other }) => ({ location: [...location], ...other }),
  },
)

const viewerConfigSchema = z.looseObject({
  homeURL: optional(z.string()),
  logoURL: optional(z.string()),
  pages: optional(z.array(pageConfigSchema)),
  map: optional(z.looseObject({})),
  locationAddresses: optional(z.array(locationAddressEntrySchema)),
})

export const DEFAULT_VIEWER_CONFIG = {
  ...DEFAULT_SCHEDULE_CONFIG,
  pages: [],
  locationAddresses: [],
} as const satisfies ViewerConfig

export const loadConfig = async (url: string): Promise<ViewerConfig> => {
  const data = await wretch(url).get().json<ScheduleConfigInput>()
  return parseViewerConfig(data)
}

export const ViewerConfigContext = createContext<ViewerConfig>(
  DEFAULT_VIEWER_CONFIG,
)
export const useViewerConfig = (): ViewerConfig => use(ViewerConfigContext)

export const parseViewerConfig = (configData: unknown): ViewerConfig => {
  const config = parseConfig(configData)
  const { map: mapConfigData, ...viewerConfig } =
    viewerConfigSchema.parse(configData)
  const mapConfig = mapConfigData ? parseMapConfig(mapConfigData) : undefined

  return {
    ...DEFAULT_VIEWER_CONFIG,
    ...config,
    ...viewerConfig,
    ...(mapConfig && { map: mapConfig }),
  }
}
