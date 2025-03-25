import HtmlWebpackPlugin from "html-webpack-plugin"
import path from "path"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import { GenerateSW } from "workbox-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"

export default (env, argv) => {
  const isProd = argv.mode != "development"
  /** @type import("webpack").Configuration */
  const config = {
    mode: isProd ? "production" : "development",
    entry: {
      schedule: "./src/main.tsx",
    },
    output: {
      path: path.resolve("./dist"),
      filename: isProd ? "js/[name].[contenthash].js" : undefined,
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          use: "swc-loader",
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
      ],
    },
    resolve: {
      extensionAlias: {
        ".js": [".js", ".jsx", ".ts", ".tsx"],
      },
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: "schedule.webmanifest",
            to: "schedule.webmanifest",
          },
          {
            from: "theme.js",
            to: "theme.js",
            info: {
              minimized: false,
            },
          },
          {
            from: "custom.css",
            to: "custom.css",
          },
          {
            from: "config.json",
            to: "config.json",
          },
        ],
      }),
      isProd
        ? new GenerateSW({
            cacheId: "schedule",
            cleanupOutdatedCaches: true,
            mode: isProd ? "production" : "development",
            exclude: [
              /\.map$/,
              /^LICENSE.*\.txt$/,
              /^manifest.*\.js$/,
              /theme\.js$/,
              /config\.json$/,
              /custom\.css$/,
            ],
            runtimeCaching: [
              {
                urlPattern: /theme\.js$/,
                handler: "NetworkFirst",
              },
              {
                urlPattern: /custom\.css$/,
                handler: "NetworkFirst",
              },
              {
                urlPattern: /config\.json$/,
                handler: "NetworkFirst",
              },
              {
                urlPattern: /\.json$/,
                handler: "NetworkFirst",
              },
            ],
            maximumFileSizeToCacheInBytes: isProd ? undefined : 20000000,
            swDest: "sw.js",
          })
        : null,
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash].css",
      }),
      new HtmlWebpackPlugin({
        template: "./index.html",
        title: "Schedule",
        chunks: ["config", "schedule"],
        minify: false,
        inject: false,
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    devServer: {
      port: 9000,
    },
  }
  return config
}
