<script setup lang="ts">
import fullScreen from "@/components/fullScreen.vue";
import theme from "@/components/theme.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getUserInfo, logout } from "@/api";
import { onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { UserInfo } from "@/types/define";
import { AxiosError } from "axios";

const authStore = useAuthStore();
const router = useRouter();
let userInfo = reactive<UserInfo>({
  id: 0,
  email: "",
  ip: "",
  name: "",
  role: "",
  sex: "",
  avatar: "",
  nickName: "",
})
function returnIndex() {
  router.push({
    path: "/"
  })
}


const receiveUserInfo = async () => {
  // const token:string = authStore.token as string; // 获取实际的 token 值
  const token: string = localStorage.getItem("token") as string
  getUserInfo(token)
    .then(res => {
      if (res.data.status === 0) {
        ElMessage({
          message: "获取用户信息成功",
          type: "success",
          duration: 3000,
        })
        Object.assign(userInfo, res.data.data) // 根据实际的响应数据结构调整
        authStore.setCheckTokenData(userInfo); // 存储用户信息到状态管理器
      }
    })
    .catch(error => {
      if (error.response) {
        const { status, reason } = error.response.data;
        if (status === 1) {
          ElMessage({
            message: reason,
            type: "error",
            duration: 3000,
          });
        }
      } else {
        console.error('请求失败', error);
      }
    });
};
const toLogout = async () => {
  const token: string | null = localStorage.getItem('token');
  if (!token) {
    ElMessage({
      message: 'No token found. You are already logged out.',
      type: 'warning',
    });
    return;
  }

  try {
    const res = await logout(token); // 假设 logout 方法会处理请求并返回响应
    // 检查响应状态或数据，根据需要进行处理
    if (res.data.status === 0) {
      ElMessage({
        message: res.data.message || '登出成功',
        type: 'success',
      });
      authStore.deleteToken() // 清除 token
      router.push({ name: 'login' }); // 重定向到登录页面
    } else {
      throw new Error(res.data.message || '登出失败');
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      const errorMessage = e.response?.data?.msg || 'An error occurred during logout.';
      ElMessage({
        message: errorMessage || '登出过程发生错误！',
        type: 'error',
      });
    } else {
      ElMessage({
        message: '登出时发生未知错误。',
        type: 'error',
      });
    }
  }
};
onMounted(() => {
  receiveUserInfo();
})
</script>

<template>
  <el-header>
    <div class="left">
      <img src="https://element-plus.org/images/element-plus-logo.svg" alt="">
      <!-- 头部面包屑 -->
      <el-breadcrumb separator="/" class="bread">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>
          <a href="/">用户管理</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="right">
      <el-tooltip content="返回前台首页">
        <i class="iconfont icon-Home" @click="returnIndex"></i>
      </el-tooltip>
      <!-- 全屏组件 -->
      <fullScreen></fullScreen>
      <!-- 主题切换组件 -->
      <el-tooltip content="切换主题">
        <theme></theme>
      </el-tooltip>
      <div class="avatar">
        <el-avatar :src="userInfo.avatar" />
      </div>
      <!-- 下拉菜单 -->
      <el-dropdown  placement="bottom-end">
        <span class="el-dropdown-link">
          {{ userInfo.name }} <el-icon size="12px">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" @click="toLogout">
              <i class="iconfont icon-tubiaozhizuomoban-" style="font-size: 20px;"></i>登出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid rgba(168, 168, 168, 0.2);
    height: 60px;

    .left {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .bread {
        margin: 20px;
        font-size: 16px;
      }
    }

    .right {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .avatar {
        margin-right: 10px;
      }

      .icon-Home {
        font-size: 27px;
        margin-right: 5px;
      }

      .el-dropdown-link {
        cursor: pointer;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
        outline: none;
        width: 100%;
      }
    }

    img {
      height: 40px;
    }
  }
</style>
