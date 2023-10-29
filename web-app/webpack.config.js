const path = require("path")

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /(?<!\.d)\.tsx?$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "web-app-bundle.js",
    path: process.env.DOCKER_BUILD_ENV === "production" ? path.resolve(__dirname, "dist") : path.resolve(__dirname, "../", "static", "js"),
  }
}
