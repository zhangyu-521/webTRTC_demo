import Vue from "vue";
import VueRouter from "vue-router";
import Index from "@/views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Index",
    component: Index,
  },
 
  {
    path: "/Home",
    name: "Home",
    component: Index,
  },
  {
    path: "/VideoConnect",
    name: "VideoConnect",
    component: () =>
      import(/* webpackChunkName: "about" */ "@/views/VideoConnect.vue"),
  },

  {
    path: "/PageContainer",
    name: "PageContainer",

    component: () => import("@/views/PageContainer.vue"),
    props: true,
  },
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

export default router;
