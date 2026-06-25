import { describe, expect, test } from "vitest"
import { getJSONLDTypesFromHierarchy } from "./ld.js"

describe("ld", () => {
  test("get types from hierarchy", () => {
    const hierarchy = {
      Test: {
        subtypes: {
          SubA: {
            subtypes: {
              SubB: {},
            },
          },
          SubC: {},
        },
      },
    } as const

    const keys = getJSONLDTypesFromHierarchy(hierarchy)
    expect(keys).toStrictEqual(["Test", "SubA", "SubB", "SubC"])
  })
})
