import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Vant from "vant";
import "vant/lib/index.css";
import { getTRTCWebSDK } from "./common/sdk/v4/webtrc.esm";
console.log(getTRTCWebSDK);
import "../public/static/vconsole.min";
Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(Vant);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
