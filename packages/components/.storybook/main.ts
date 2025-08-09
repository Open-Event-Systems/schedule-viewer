import type { StorybookConfig } from "@storybook/react-webpack5"
import type { Options } from "@swc/core"

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-webpack5-compiler-swc", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  swc: (options: Options): Options => {
    return {
      ...options,
      jsc: {
        transform: {
          react: {
            runtime: "automatic",
          },
        },
      },
    }
  },
  webpack: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config.module?.rules ?? []),
          {
            test: /\.scss$/,
            use: ["style-loader", "css-loader", "sass-loader"],
          },
        ],
      },
      resolve: {
        ...config.resolve,
        extensionAlias: {
          ".js": [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    }
  },
}
export default config
