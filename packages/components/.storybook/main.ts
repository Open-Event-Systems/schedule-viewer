import type { StorybookConfig } from "@storybook/react-webpack5"
import type { Options } from "@swc/core"

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: "@storybook/addon-styling-webpack",

      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: ["style-loader", "css-loader"],
          },
          {
            test: /\.s[ac]ss$/,
            sideEffects: true,
            use: ["style-loader", "css-loader", "sass-loader"],
          },
        ],
      },
    },
  ],
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
