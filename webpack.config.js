const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "development",
  entry: "./ts/index.ts",
  output: {
    path: dist,
    filename: "[name].js",
  },
  devServer: {
    allowedHosts: ["localhost", "locohost"],
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    watchFiles: ["./static/index.html"],
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "static"),
          to: dist,
        },
      ],
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
      extraArgs: "--features=wasm",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          // Use `.swcrc` to configure swc
          loader: "swc-loader",
        },
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".json", ".mjs"],
  },
};
