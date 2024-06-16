<script lang="ts" setup>
import { login, toRefreshToken } from "@/api"
import { useAuthStore } from "@/stores/auth"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import { ref, computed, watch } from "vue"
import { View, Hide } from "@element-plus/icons-vue"
import theme from "@/components/theme.vue"
import { errorCode } from "@/utils/errcode"

const router = useRouter()
const loginForm = ref({
  username: "",
  email: "",
  password: "",
})
const rememberMe = ref(false) /* 是否七天免登录 */
const isPasswordVisible = ref(false) //密码输入框是否可见
const tokenExpireTime = ref<number | null>(null)  // 用于存储token过期时间的变量
const authStore = useAuthStore()

const onSubmitWithName = () => {
  login(loginForm.value.username, loginForm.value.password)
    .then(res => {
      if (res.data.status === 0) {
        ElMessage({
          message: "登录成功",
          type: "success",
          duration: 3000,
        })

        authStore.setData(res.data.data)
        if (rememberMe.value) {
          // localStorage.setItem("rememberMe", rememberMe.value.toString())
          tokenExpireTime.value = res.data.data.expiredAt // 假设接口返回token过期时间
          setTokenRefreshTimer()
        }

        router.push({ path: "/admin" })
      }

    })
    .catch(error => {
      console.error(error.response.data.reason)
        ElMessage({
          message: errorCode[error.response.data.status],
          type: "error",
          duration: 3000,
        });
    })
}

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const canSubmit = computed(() => {
  const { username, password } = loginForm.value
  return Boolean(username && password)
})

// 监听 rememberMe 和 tokenExpireTime的变化
watch([rememberMe, tokenExpireTime], ([newRememberMe, newTokenExpireTime]) => {
  if (newRememberMe && newTokenExpireTime) {
    setTokenRefreshTimer();
  }
});


// 设置token刷新定时器
const setTokenRefreshTimer = () => {
  if (!tokenExpireTime.value) return

  const currentTime = Date.now()
  const refreshTime = tokenExpireTime.value - currentTime - 60000  // 提前1分钟刷新token

  if (refreshTime > 0) {
    /* 设置定时器，取刷新token */
    setTimeout(refreshTokenFun, refreshTime)
  }
}

// 刷新token
const refreshTokenFun = () => {
  const refreshToken = authStore.refreshToken as string
  toRefreshToken(refreshToken)
    .then(res => {
      // 假设返回新的token和新的过期时间
      const resData = res.data.data
      authStore.setData(resData)
      tokenExpireTime.value = resData.expiredAt
      setTokenRefreshTimer()
    })
    .catch(error => {
      console.error('Token刷新失败:', error)
    })
}

</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-main">
        <div class="top-section">
          <div class="form-container">
            <div class="form-top">
              <div class="title">密码登录</div>
              <div class="right">
                <theme></theme>
              </div>
            </div>
            <el-divider />
            <el-form class="login-form">
              <div class="input-container">
                <div class="input-group">
                  <input v-model="loginForm.username" type="text" placeholder="" />
                  <label class="placeholder">用户名</label>
                </div>
                <div class="input-group">
                  <input v-model="loginForm.password" :type="isPasswordVisible ? 'text' : 'password'" placeholder=""
                    autocomplete="on" />
                  <label class="placeholder">密码</label>
                  <div class="password-toggle">
                    <el-icon @click="togglePasswordVisibility">
                      <component :is="isPasswordVisible ? View : Hide" />
                    </el-icon>
                  </div>
                </div>
              </div>
              <div class="remember-row">
                <el-checkbox v-model="rememberMe" class="rememberMe">
                  一周内免登录
                  <el-tooltip content="勾选并登录后，规定天数内无需重新登录即可进入系统" placement="top">
                    <el-icon>
                      <Warning />
                    </el-icon>
                  </el-tooltip>
                </el-checkbox>
                <router-link to="/login/forgetPassword" class="forgot-password">忘记密码?</router-link>
              </div>
              <el-button type="primary" class="login-button" :disabled="!canSubmit" @click="onSubmitWithName"
                size="large">登录</el-button>
            </el-form>
          </div>
        </div>
        <div class="bottom-section">
          <el-divider>第三方登录</el-divider>
          <div class="other-login">
            <div class="icon-container">
              <el-tooltip content="邮箱登录" placement="bottom">
                <router-link to="/login/email"><i class="iconfont icon-youxiang1"></i></router-link>
              </el-tooltip>
              <el-tooltip content="QQ登录" placement="bottom">
                <router-link to="#"> <i class="iconfont icon-logo-qq"></i></router-link>
              </el-tooltip>
              <el-tooltip content="github登录" placement="bottom">
                <router-link to="#"> <i class="iconfont icon-github"></i></router-link>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="signup">
      <span>还没有账号？</span>
      <el-link type="primary" href="/login/signup" underline>去注册</el-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .login-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: var(--login-bg-gradient);
  }

  .login-container {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-radius: 40px;
    overflow: hidden;
    width: 500px;
    background-color: #fff;
  }

  .login-main {
    padding: 20px 30px;

    .top-section {
      margin-bottom: 20px;
    }

    .bottom-section {
      text-align: center;
    }
  }

  .form-container {
    padding: 20px;
  }

  .form-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 24px;
      font-weight: bold;
      color: #2575fc;
    }
  }

  .input-container {
    .input-group {
      position: relative;
      margin-bottom: 25px;
      font-weight: 700;

      input {
        width: 100%;
        height: 2.5rem;
        padding: 5px;
        border: 2px solid rgba($color: #000, $alpha: 0.3);
        border-radius: 5px;
        outline: none;
        transition: border-color 0.3s;

      }

      input:focus {
        border-color: #2575fc;
      }

      .placeholder {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        transition: all 0.3s;
        color: #999;
        font-size: 14px;
      }

      input:focus+.placeholder,
      input:not(:placeholder-shown)+.placeholder {
        top: -10px;
        color: #2575fc;
      }

      .password-toggle {
        position: absolute;
        top: 55%;
        right: 10px;
        transform: translateY(-50%);
        cursor: pointer;

        .toggle-icon {
          font-size: 20px;
          color: #999;
        }
      }
    }
  }

  .remember-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .rememberMe {
      position: relative;

      .el-icon {
        position: absolute;
        left: 110px;
        top: 9px;
      }
    }
  }

  .forgot-password {
    font-size: 14px;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      color: #2575fc;
    }
  }

  .login-button {
    width: 100%;
    padding: 10px;
    background-color: #2575fc;
    border: none;
    border-radius: 5px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #2575fc;
    }

    &:disabled {
      background-color: var(--el-button-disabled-bg-color);
    }
  }

  .other-login {
    margin-top: 20px;

    .icon-container {
      display: flex;
      justify-content: center;
      gap: 30px;

      .iconfont {
        font-size: 30px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #2575fc;
        }
      }
    }
  }

  .signup {
    display: flex;
    align-items: center;
    margin-top: 10px;
    text-align: center;

    .el-link {
      color: #0ea0e3;
      font-weight: 600;
      font-size: 16px;
    }

    span {
      margin-right: 10px;
    }
  }
</style>
