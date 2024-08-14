<script lang="ts" setup>
import { login, toRefreshToken } from "@/api";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import { View, Hide, Warning } from "@element-plus/icons-vue";
import theme from "@/components/theme";
import { errorCode } from "@/utils/errcode";
import type { PasswordLogin } from "@/types";
import { useLoginTypeStore } from "@/stores/loginType";
const authStore = useAuthStore();
const loginTypeStore = useLoginTypeStore();
const router = useRouter();
const isPasswordVisible = ref(false); //密码输入框是否可见

const loginForm = reactive<PasswordLogin>({
  username: "",
  email: "",
  password: "",
});
const showMessage = (
  message: string,
  type: "success" | "warning" | "info" | "error"
) => {
  ElMessage({
    message,
    type,
    duration: 3000,
  });
};
// 处理错误逻辑
const handleError = (error: any) => {
  if (error.response && error.response.data && error.response.data.status) {
    if (error.response.data.status === 1) {
      showMessage(error.response.data.reason, "error");
    } else {
      showMessage(errorCode[error.response.data.status] || "未知错误", "error");
    }
  } else {
    showMessage("请求失败，请稍后再试.", "error");
  }
};
const onSubmitWithName = async () => {
  try {
    const res = await login(loginForm.username, loginForm.password);
    if (res.data.status === 0) {
      ElNotification({
        title: "Success",
        type: "success",
        message: "登录成功,欢迎回来",
      });
      authStore.setData(res.data.data);

      if (authStore.rememberMe) {
        localStorage.setItem("rememberMe", authStore.rememberMe.toString());
        setupTokenRefresh();
      }
      // 获取重定向路径
      const redirectPath = router.currentRoute.value.query.redirect || "/admin";
      
      // 跳转到指定路径
      await router.push({ path: redirectPath as string });
    }
  } catch (error: any) {
    handleError(error);
  }
};

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const canSubmit = computed(() => {
  const { username, password } = loginForm;
  return Boolean(username && password);
});

// 定时器ID
let tokenRefreshTimeoutId: number | null = null;

// 刷新 token 的方法
async function refreshToken() {
  const rtk = authStore.refreshToken as string;
  if (!rtk) {
    showMessage("刷新令牌不存在", "error");
    return;
  }

  try {
    const res = await toRefreshToken(rtk);
    if (res.data.status === 0) {
      // 刷新成功后更新 localStorage
      authStore.setData(res.data.data);
      // 再次设置刷新定时器
      setupTokenRefresh();
    }
  } catch (error) {
    await router.push({ path: "/login" });
    authStore.deleteToken();
    console.error("刷新令牌失败:", error);
    // showMessage("刷新令牌失败", "error");

    if (tokenRefreshTimeoutId !== null) {
      clearTimeout(tokenRefreshTimeoutId);
      tokenRefreshTimeoutId = null;
    }
  }
}

// 设置 token 刷新的定时器
function setupTokenRefresh() {
  const currentTime = Math.floor(Date.now() / 1000); // 当前时间的 UNIX 时间戳（秒）
  const expiredAt = Number(localStorage.getItem("expiredAt")); // 过期时间的 UNIX 时间戳（秒）
  if (isNaN(expiredAt)) {
    console.error("过期时间无效");
    return;
  }

  const remainingTime = expiredAt - currentTime; // 剩余时间（秒）

  if (tokenRefreshTimeoutId !== null) {
    clearTimeout(tokenRefreshTimeoutId);
    tokenRefreshTimeoutId = null;
  }

  tokenRefreshTimeoutId = window.setTimeout(() => {
    refreshToken();
  }, remainingTime * 1000); // 剩余时间减去提前刷新时间后的毫秒数
}
</script>

<template>
  <div>
    <div class="login-page flex flex-col justify-center items-center h-screen">
      <div
        class="login-container overflow-hidden w-1/3 bg-white rounded-3xl shadow-lg"
      >
        <div class="login-main py-5 px-7">
          <div class="form-container p-4">
            <!-- 表单头部 -->
            <div class="form-top flex justify-between items-center">
              <span class="title text-2xl font-bold text-blue-400"
                >密码登录</span
              >
              <theme></theme>
            </div>
            <el-divider />
            <!-- 表单主体 -->
            <el-form>
              <div class="input-container">
                <div class="input-group relative mb-6">
                  <input
                    v-model="loginForm.username"
                    type="text"
                    class="w-full h-10 px-3 border-2 border-gray-300 rounded focus:border-blue-500 outline-none transition-all duration-300"
                    placeholder=""
                  />
                  <label
                    class="placeholder absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400 transition-all duration-300"
                    >用户名</label
                  >
                </div>
                <div class="input-group relative mb-6">
                  <input
                    v-model="loginForm.password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    class="w-full h-10 px-3 border-2 border-gray-300 rounded focus:border-blue-500 outline-none transition-all duration-300"
                    placeholder=""
                    autocomplete="on"
                  />
                  <label
                    class="placeholder absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400 transition-all duration-300"
                    >密码</label
                  >
                  <div
                    class="password-toggle absolute top-2.5 right-2 cursor-pointer"
                  >
                    <el-icon @click="togglePasswordVisibility">
                      <component :is="isPasswordVisible ? View : Hide" />
                    </el-icon>
                  </div>
                </div>
              </div>
              <div
                class="remember-row flex justify-between items-center text-sm mb-6"
              >
                <el-checkbox
                  v-model="authStore.rememberMe"
                  class="rememberMe relative"
                >
                  一周内免登录
                  <el-tooltip
                    class="top-2"
                    content="勾选并登录后，规定天数内无需重新登录即可进入系统"
                    placement="top"
                  >
                    <el-icon class="absolute left-28">
                      <Warning />
                    </el-icon>
                  </el-tooltip>
                </el-checkbox>
                <el-button
                  @click="loginTypeStore.toggleLoginType('forgetPassword')"
                  link
                  ><span
                    class="forgot-password text-gray-500 hover:underline hover:text-blue-500"
                    >😂忘记密码?</span
                  >
                </el-button>
              </div>
              <el-button
                type="primary"
                size="large"
                class="login-button w-full py-2 bg-blue-500 text-white text-lg rounded hover:bg-blue-600 disabled:bg-gray-300"
                :disabled="!canSubmit"
                @click="onSubmitWithName"
                >登录
              </el-button>
            </el-form>
          </div>
          <div class="bottom-section text-center mt-6">
            <el-divider>第三方登录</el-divider>
            <div class="other-login mt-4">
              <div class="icon-container flex justify-center gap-6">
                <el-tooltip content="邮箱登录" placement="bottom">
                  <el-button @click="loginTypeStore.toggleLoginType('email')"
                    ><i
                      class="iconfont icon-youxiang text-2xl cursor-pointer hover:text-blue-500"
                    ></i
                  ></el-button>
                </el-tooltip>
                <el-tooltip content="QQ登录" placement="bottom">
                  <el-button
                    ><i
                      class="iconfont icon-qq text-2xl cursor-pointer hover:text-blue-500"
                    ></i>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="github登录" placement="bottom">
                  <el-button
                    ><i
                      class="iconfont icon-github text-2xl cursor-pointer hover:text-blue-500"
                    ></i>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="signup flex items-center mt-4 text-center">
        <span class="mr-1">还没有账号？</span>
        <el-button
          type="primary"
          @click="loginTypeStore.toggleLoginType('register')"
          link
          ><span
            class="text-sky-500 hover:underline hover:text-sky-400 text-base font-bold"
            >➡️去注册吧!</span
          ></el-button
        >
      </div>
    </div>
    <div class="footer fixed bottom-0 left-0 w-full py-2 text-center">
      <el-link
        href="https://beian.miit.gov.cn/"
        target="_blank"
        type="default"
        class="footerLink text-base inline-flex items-center"
      >
        <img src="/src/assets/img/beian.png" alt="备案图片" class="h-4 mr-1" />
        <span>粤ICP备2024184954号-1</span>
      </el-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.placeholder {
  font-size: 0.875rem; // Tailwind CSS中的 text-sm 相当于 14px
}

input:focus + .placeholder,
input:not(:placeholder-shown) + .placeholder {
  top: 0;
  left: 0.5rem;
  color: #3b82f6 !important;
  transform: translateY(-100%) !important;
}
</style>
