import {isUserLoggedIn} from '@/api';
import {createRouter, createWebHistory} from 'vue-router'
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
            // component: () => import("@/views/login/index.vue"),
            redirect: "/login/pwd",
            beforeEnter: async (to, from) => {
                const loggedIn = await isUserLoggedIn();
                if (loggedIn) {
                    ElMessage({
                        message: '您已登录，无需再次登录',
                        type: 'warning',
                        duration: 3000,
                    });
                    return {path: from.path}; // 阻止导航
                } else {
                    return true;
                }
            },
            children: [
                {
                    path: "/login/pwd",
                    name: "loginPwd",
                    component: () => import("@/views/login/loginPwd.vue"),
                    meta: {title: "密码登录"}
                },
                {
                    path: "/login/email",
                    name: "loginEmail",
                    component: () => import("@/views/login/loginEmail.vue"),
                    meta: {title: "邮箱登录"}
                },
                {
                    path: "/login/forgetPassword",
                    name: "forgetPassword",
                    component: () => import("@/views/login/forgetPassword.vue"),
                    meta: {title: "重置密码"}
                },
                {
                    path: "/login/signup",
                    name: "signup",
                    component: () => import("@/views/login/register.vue"),
                    meta: {title: "用户注册"}
                },
            ],
        },

        {
            path: "/:pathMatch(.*)*",
            name: "NotFound",
            component: () => import("@/views/exception/404.vue"),
            meta: {title: "404"}
        },
        {
            path: "/exception/403",
            name: "Forbidden",
            component: () => import("@/views/exception/403.vue"),
            meta: {title: "403"}
        },
        {
            path: "/exception/500",
            name: "ServerError",
            component: () => import("@/views/exception/500.vue"),
            meta: {title: "500"}
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
                    component: () => import("@/views/admin/home/home.vue"),
                    meta: {requireAuth: true, title: "首页"}
                },
                {
                    path: "/admin/systemManage",
                    name: "systemManage",
                    meta: {requireAuth: true, role: "admin", title: "系统管理"},
                    redirect: "/admin/systemManage/userManage",
                    children: [
                        {
                            path: "/admin/systemManage/userManage",
                            name: "userManage",
                            component: () => import("@/views/admin/user/userManage.vue"),
                            meta: {requireAuth: true, role: "admin", title: "用户管理"}
                        },
                        {
                            path: "/admin/systemManage/articleManage",
                            name: "articleManage",
                            component: () => import("@/views/admin/article/articleManage.vue"),
                            meta: {requireAuth: true, role: "admin", title: "文章管理"}
                        },
                    ]
                },
                {
                    path: "/admin/userInfo",
                    name: "userInfo",
                    component: () => import("@/views/admin/user/userInfo.vue"),
                    meta: {requireAuth: true, title: "用户信息"}
                },
                {
                    path: "/admin/userCollection",
                    name: "userCollection",
                    component: () => import("@/views/admin/user/userCollection.vue"),
                    meta: {requireAuth: true, role: "admin", title: "用户收藏"}
                },
                {
                    path: "/admin/userPost",
                    name: "userPost",
                    component: () => import("@/views/admin/user/userPost.vue"),
                    meta: {requireAuth: true, role: "admin", title: "用户发布"}
                },
                {
                    path: "/admin/about",
                    name: "about",
                    component: () => import("@/views/admin/site/siteInfo.vue"),
                    meta: {requireAuth: true, title: "关于"}
                },

            ],
        },

        // 前台路由
        {
            path: "/home",
            name: "home",
            component: () => import("@/views/web/home.vue"),
            meta: {title: "xie-blog"} // 添加meta属性
        }
    ]
})
/* 全局前置守卫 */
router.beforeEach(async (to) => {
    start(); // 开启进度条
    if (to.meta.requireAuth) {
        const isLogin = await isUserLoggedIn();  // 判断是否登录
        if (isLogin) {
            if (to.meta.role === "admin")
                if (localStorage.getItem("scope") === "admin") {
                    return true;
                } else {
                    return ({name: "Forbidden"});
                }
            return true;
        } else {
            return ({name: "login"});
        }
    } else {
        return true;
    }
});

/* 全局后置守卫 */
router.afterEach((to) => {
    close()//关闭进度条
    document.title = to.meta.title as string
})

export default router