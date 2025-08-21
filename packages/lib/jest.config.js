import { createJsWithTsEsmPreset } from "ts-jest"

/** @type {import('jest').Config} */
const presetConfig = createJsWithTsEsmPreset({})

presetConfig.moduleNameMapper = {
  "(.+)\\.js$": "$1",
}

export default {
  ...presetConfig,
}
