const packageName = process.env.VUE_APP_PACKAGE_NAME || "HybridApp";

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH || "/",
  outputDir: packageName,
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
