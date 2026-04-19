import { createRouter, createWebHistory } from "vue-router"
import TableView from "@/views/TableView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "table",
      component: TableView,
    },
    {
      path: "/compare",
      name: "compare",
      component: () => import("@/views/CompareView.vue"),
    },
    {
      path: "/trends",
      name: "trends",
      component: () => import("@/views/TrendsView.vue"),
    },
    {
      path: "/quiz",
      name: "quiz",
      component: () => import("@/views/QuizView.vue"),
    },
    {
      path: "/tools",
      name: "tools",
      component: () => import("@/views/ToolsView.vue"),
    },
  ],
})

export default router
