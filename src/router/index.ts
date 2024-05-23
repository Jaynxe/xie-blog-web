import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name:"login",
      component:() => import ("@/views/login.vue")
    },
    // 博客前端后台
    {
      path: "/admin",
      name:"admin",
      component:() => import ("@/views/admin/admin.vue"),
      children:[]
    },
   
  ]
})

export default router
