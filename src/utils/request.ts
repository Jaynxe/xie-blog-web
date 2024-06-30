import axios from "axios";
import {useAuthStore} from "@/stores/auth";

const service = axios.create({
  baseURL: "http://127.0.0.1:8888/api/",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // 允许携带cookie
});

// 响应拦截器处理错误的函数
// async function handleRequestError(error:any) {
//     if (error && error.response && error.response.data && error.response.data.status) {
//         const statusCode = error.response.data.status;
//
//         if (statusCode === 7) {
//             try {
//                 const loggedIn = await isUserLoggedIn();
//
//                 if (loggedIn) {
//                     ElMessage({
//                         message: "抱歉您无权访问",
//                         type: "warning",
//                         duration: 3000,
//                     });
//                     await router.push({ name: "Forbidden" });
//                 } else {
//                     ElMessage({
//                         message: "抱歉您还未登录",
//                         type: "warning",
//                         duration: 3000,
//                     });
//                     await router.push({ name: "login" });
//                 }
//             } catch (err) {
//                 ElMessage({
//                     message: "检查用户登录状态时出错",
//                     type: "error",
//                     duration: 3000,
//                 });
//                 await router.push({ name: "login" });
//             }
//             return;
//         } else {
//             if (statusCode === 1){
//                 ElMessage({
//                     message: error.response.data.msg,
//                     type: 'error',
//                     duration: 3000,
//                 });
//             }else if(statusCode === 2){ // token失效
//                 ElMessage({
//                    message: errorCode[statusCode] || "未知错误",
//                     type: 'error',
//                     duration: 3000,
//                 });
//                 const authStore = useAuthStore();
//                 authStore.deleteToken()
//             } else{
//                 ElMessage({
//                     message: errorCode[statusCode] || "未知错误",
//                     type: 'error',
//                     duration: 3000,
//                 });
//             }
//             return;
//         }
//     } else {
//         // 如果 error 对象结构不符合预期，直接显示一个通用错误消息
//         ElNotification({
//             title: "发生错误",
//             message: "发生未知错误",
//             type: 'error',
//             duration: 3000,
//         });
//
//         return;
//     }
// }

// 白名单放置一些不需要token的接口
const whiteList = ['login','register','resetPassword','refresh','loginWithEmail'];

// 请求拦截器
service.interceptors.request.use( async (config) => {
        const authStore = useAuthStore();
        const token = authStore.token;
        // 检查是否在白名单中
        if (whiteList.some(url => config.url?.endsWith(url))) {
            return config; // 白名单请求，不添加token直接返回配置
        }
        // 添加token
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use((response) => {
      // 响应数据，不做处理
        return response;
    },async (error) => {
        return Promise.reject(error)
    }
);

export default service;
