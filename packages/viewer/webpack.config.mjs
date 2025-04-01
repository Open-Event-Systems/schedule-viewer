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
      publicPath: "/",
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
            from: "config.js",
            to: "config.js",
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
            navigateFallback: "index.html",
            navigateFallbackDenylist: [/\.[a-zA-Z0-9-]+$/],
            modifyURLPrefix: {
              "/": "",
            },
            exclude: [
              /\.map$/,
              /^LICENSE.*\.txt$/,
              /^manifest.*\.js$/,
              /config\.js$/,
              /config\.json$/,
              /custom\.css$/,
            ],
            runtimeCaching: [
              {
                urlPattern: /config\.js$/,
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
        title: "Event Schedule",
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
      historyApiFallback: true,
    },
  }
  return config
}
