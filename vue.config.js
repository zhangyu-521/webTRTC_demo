const packageName = process.env.VUE_APP_PACKAGE_NAME || "HybridApp";
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH || "/",
  outputDir: packageName,

  configureWebpack: {
    plugins: [
      new HtmlWebpackPlugin({
        favicon: path.resolve(__dirname, './public/favicon.ico'),
        title: '远程银行',
        template: path.resolve(__dirname, './public/index.html'),
      }),
    ],
  },

  devServer: {
    proxy: {
      "/api": {
        target: "https://testopen.shrbank.com:89/ycyh3/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  }

};
