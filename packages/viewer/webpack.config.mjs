import HtmlWebpackPlugin from "html-webpack-plugin"
import path from "path"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

export default (env, argv) => {
  const isProd = argv.mode != "development"
  /** @type import("webpack").Configuration */
  const config = {
    mode: isProd ? "production" : "development",
    entry: "./src/main.tsx",
    output: {
      path: path.resolve("./dist"),
      filename: "schedule.js",
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
      new MiniCssExtractPlugin({
        filename: "schedule.css",
      }),
      isProd
        ? false
        : new HtmlWebpackPlugin({
            template: "./index.html",
            title: "Schedule",
          }),
    ],
    devServer: {
      port: 9000,
    },
  }
  return config
}
