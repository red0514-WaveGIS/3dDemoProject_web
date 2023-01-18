const path = require("path")
const cesiumSource = './node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  assetsDir: "./static",
  publicPath: "/3dDemoProject_web/",
  pages: {
    index: {
      entry: "src/main/index.js",
      template: "public/index.html",
      filename: "index.html",
      title: "3D地圖平台",
      chunks: [
        "chunk-vendors",
        "chunk-common",
        "index"
      ]
    },
  },
  filenameHashing: true,
  productionSourceMap: false,
  transpileDependencies: [
    'vuetify', 'cesium'
  ],
  devServer:{
    proxy: {
      "/api/user/": {
        target: "http://52.187.182.187:8080/api/user/",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api/user/": ""
        }
      },
      // "/api/floodedMap/": {
      //   target: "http://192.168.1.142:5030/",
      //   ws: false,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/api/floodedMap/": ""
      //   }
      // },
      "/api/floodedMap/": {
        target: "http://192.168.1.172:5030/",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api/floodedMap/": ""
        }
      },
      // "/api/climateGan/": {
      //   target: "http://192.168.1.142:5030/floodimages",
      //   ws: false,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/api/climateGan/": ""
      //   }
      // },
      "/api/3dtiles/": {
        target: "https://3dtiles.nlsc.gov.tw/",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api/3dtiles/": ""
        }
      },
      "/api/javaapi/": {
        target: "http://52.187.182.187/",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api/javaapi/": ""
        }
      },
      "/api/3dproject/": {
        target: "http://192.168.1.23/3dDemoProject_web/",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api/3dproject/": ""
        }
      },
    }
  },
  pluginOptions: {
    i18n: {
      locale: 'zhHant',
      fallbackLocale: 'en',
      localeDir: 'assets/locales',
      enableInSFC: true
    }
  },
  chainWebpack: config => {
    config
      .resolve
        .alias
        .set("cesium", path.resolve(__dirname, `${cesiumSource}/Cesium.js`)) // 縮寫import xxx from "cesium" 相等於 import xxx from "./node_modules/cesium/Source/Cesium.js"
        .set("cesiumStyle", path.resolve(__dirname, `${cesiumSource}/Widgets/widgets.css`)) // 可以直接寫import "cesiumStyle"

		
    config
      .output
      .sourcePrefix(" ")

    config
      .module
        .set('unknownContextCritical', false) // 必須要加，不然會出現下圖[1]錯誤，原因是因為webpack並不知道require.resolve的回傳值是什麼。
		
    // 這個則是修改DefinePlugin，因為CLI裡面已經有預設了，下圖[2],DefinePlugin所以這裡我們拿到define之後修改，拿到物件後做淺拷貝新增key和value
    // DefinePlugin就是可以替換整個專案的變量，這裡就是把cesium內寫的CESIUM_BASE_URL換成我們指定的路徑，開發時必須使用，設定完後記得到public資料夾內把Cesium的檔案放進去，才可以讀到檔案，如下圖[3]。
    config.plugin('define').tap(definitions => {
      definitions[0] = Object.assign(definitions[0], {
        "CESIUM_BASE_URL": JSON.stringify('./')
      })
      return definitions
    })
      
    // 修改 copy-webpack-plugin
    // 主要是再打包時的設定把整個資料夾放到 /dist 底下(與index.html同層，這樣是正確的，像是會讀取http://localhost:5500/highway/Widgets/Images/ImageryProviders/earthAtNight.png)，開發時不需要
    // 鏈式呼叫.plugin("名稱")，自己區的名稱，如果和CLI沒有預設包進來的模組衝突的話，要再指定使用模組。
    // 這裡要把下載的node_module複製給dev-server使用
    config
      .plugin("copy")
      .use(require('copy-webpack-plugin'),[
        [
          { from: path.join(cesiumSource, cesiumWorkers), to: "Workers"},
          { from: path.join(cesiumSource, "Assets"), to: "Assets"},
          { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
          { from: path.join(cesiumSource, "ThirdParty/Workers"), to: "ThirdParty/Workers" }
        ]
      ])
  }
}
