import type { StorybookConfig } from "@storybook/react-vite"
import { mergeConfig, type InlineConfig } from "vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      build: {
        rolldownOptions: {
          output: {
            preserveModules: true,
            preserveModulesRoot: ".",
          },
        },
      },
    } satisfies InlineConfig)
  },
}
export default config
