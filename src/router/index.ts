import { isUserLoggedIn } from '@/api';
import { createRouter, createWebHistory } from 'vue-router'
import {close, start} from '@/utils/nprogress'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      path: "/login",
      name: "login",
      redirect: "/login/pwd",
      children: [
        {
          path: "/login/pwd",
          name: "loginPwd",
          component: () => import("@/views/login/loginPwd.vue"),
        },
        {
          path: "/login/email",
          name: "loginEmail",
          component: () => import("@/views/login/loginEmail.vue"),
        },
        {
          path: "/login/forgetPassword",
          name: "forgetPassword",
          component: () => import("@/views/login/forgetPassword.vue")
        },
        {
          path: "/login/signup",
          name: "signup",
          component: () => import("@/views/login/register.vue")
        },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/exception/404.vue")
    },
    {
      path: "/exception/403",
      name: "Forbidden",
      component: () => import("@/views/exception/403.vue")
    },
    // 博客前端后台
    {
      path: "/admin",
      name: "admin",
      redirect: "/admin/home", //重定向至后台首页
      component: () => import("@/views/admin/admin.vue"),
      children: [
        {
          path: "/admin/home",
          name: "adminHome",
          component: () => import("@/views/admin/home/home.vue")
        },
        {
          path: "/admin/userManage",
          name: "userManage",
          component: () => import("@/views/admin/user/userManage.vue")
        },
        {
          path: "/admin/userInfo",
          name: "userInfo",
          component: () => import("@/views/admin/user/userInfo.vue")
        },
        {
          path: "/admin/userCollection",
          name: "userCollection",
          component: () => import("@/views/admin/user/userCollection.vue")
        },
        {
          path: "/admin/userPost",
          name: "userPost",
          component: () => import("@/views/admin/user/userPost.vue")
        },
        {
          path: "/admin/siteInfo",
          name: "siteInfo",
          component: () => import("@/views/admin/site/siteInfo.vue")
        },
        {
          path: "/admin/articleManage",
          name: "articleManage",
          component: () => import("@/views/admin/article/articleManage.vue")
        },
      ]
    },
    // 前台路由
    {
      path: "/home",
      name:"home",
      component: () => import("@/views/web/home.vue"),
    }
  ]
})


router.beforeEach(async (to, from, next) => {
  start();//开启进度条
  const loggedIn = await isUserLoggedIn();
  const loginRoutes:string[] = ['login', 'loginPwd', 'loginEmail', 'forgetPassword', 'signup'];
  if ((loginRoutes.includes(to.name as string) || to.path.startsWith('/login')) && loggedIn) {
    ElMessage({
      message: '您已登录，无需再次登录',
      type: 'warning',
      duration: 3000,
    });
    // console.log(from.path)
    next({ path:from.path }); // 重定向到主页或其他已登录用户可以访问的页面
  } else {
    next(); // 继续导航
  }
});
router.afterEach(() => {
  close()//关闭进度条
})
export default router
