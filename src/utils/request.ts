import { useAuthStore } from "@/stores/auth"
import { errorCode } from "@/utils/errcode"
import router from "@/router/index.js"
import axios from "axios"
import { ElMessage, ElNotification } from "element-plus"
import { isUserLoggedIn } from "@/api"

const service = axios.create({
  baseURL: "http://127.0.0.1:8888/api/",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

// 处理错误的函数
async function handleRequestError(error: { response: { data: { status: any } } }) {
  let errorMessage = "请求失败";
  if (error.response && error.response.data && error.response.data.status) {
    const statusCode = error.response.data.status;
    errorMessage = errorCode[statusCode] || "未知错误";
    if (statusCode === 7) {
      // 状态码为7，没有权限访问此网站
      try {
        // 检查用户登录状态，使用 await 等待结果
        const loggedIn = await isUserLoggedIn();
        if (loggedIn) {
          // 已登录但无权访问，跳转到403页面
          ElMessage({
            message: "抱歉您无权访问",
            type: "warning",
            duration: 3000,
          });
          router.push({ name: "Forbidden" });
          
        } else {
          // 未登录或登录失效，跳转到登录页面
          ElMessage({
            message: "抱歉您还未登录",
            type: "warning",
            duration: 3000,
          });
          router.push({ name: "login" });
        }
      } catch (error) {
        console.error("检查用户登录状态时出错:", error);
        // 默认情况下跳转到登录页面
        router.push({ name: "login" });
      }

      return; // 终止函数继续执行
    }
  }
  // 如果不是状态码为7的情况，显示一般错误通知
  ElNotification({
    title: "发生错误",
    message: errorMessage,
    type: "error",
    duration: 3000,
  });
}

// 添加请求拦截器
service.interceptors.request.use(config => {
  const useAuth = useAuthStore()
  const token = useAuth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 响应数据，不做处理
    return response
  },
  error => {
    // 响应错误，交给错误函数处理
    handleRequestError(error)
    return Promise.reject(error)
  }
)

export default service