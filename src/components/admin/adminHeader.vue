<script setup lang="ts">
import fullScreen from "@/components/fullScreen";
import theme from "@/components/theme.js";
import {ArrowDown} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth";
import {getUserInfo, logout} from "@/api";
import {onMounted} from "vue";
import {ElMessage} from "element-plus";
import type {UserInfo} from "@/types/define";
import {errorCode} from "@/utils/errcode";

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
  nick_name: "",
})

function returnIndex() {
  router.push({
    path: "/"
  })
}

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

const showMessage = (message: string, type: 'success' | 'warning' | 'info' | 'error') => {
  ElMessage({
    message,
    type,
    duration: 3000,
  });
};
// 获取用户信息
const receiveUserInfo = async () => {
  try {
    const res = await getUserInfo();
    if (res.data.status === 0) {
      // showMessage("获取用户信息成功", "success");
      Object.assign(userInfo, res.data.data); // 根据实际的响应数据结构调整
      authStore.setCheckTokenData(userInfo); // 存储用户信息到状态管理器
    }
  } catch (error: any) {
    handleError(error)
  }
};

// 登出
const toLogout = async () => {
  try {
    const res = await logout(); // 假设 logout 方法会处理请求并返回响应
    // 检查响应状态或数据，根据需要进行处理
    if (res.data.status === 0) {
      showMessage(res.data.message || '登出成功', "success")
      authStore.deleteToken() // 清除 token
      await router.push({name: 'login'}); // 重定向到登录页面
    }
  } catch (error: any) {
    handleError(error)
  }
};
onMounted(() => {
  receiveUserInfo();
})
</script>

<template>
  <div class=" flex justify-between items-center  h-16">
    <div class="header-left flex items-center">
      <img src="https://element-plus.org/images/element-plus-logo.svg" alt="Logo" class="h-10">
      <!-- 头部面包屑 -->
      <el-breadcrumb class="ml-4 text-base outline-none">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>
          <a href="/" class="text-blue-600">用户管理</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right flex items-center">
      <el-tooltip content="返回前台首页">
        <i class="iconfont icon-Home text-3xl cursor-pointer mr-2.5" @click="returnIndex"></i>
      </el-tooltip>
      <!-- 全屏组件 -->
      <fullScreen class="mr-2.5"></fullScreen>
      <!-- 主题切换组件 -->
      <el-tooltip content="切换主题">
        <theme class="mr-3"></theme>
      </el-tooltip>
      <div class="avatar mr-2.5">
        <el-avatar :src="userInfo.avatar"/>
      </div>
      <!-- 下拉菜单 -->
      <el-dropdown placement="bottom-end">
        <span class=" w-full flex items-center cursor-pointer outline-none">
          {{ userInfo.name }} <el-icon size="12px" class="ml-1"><ArrowDown/></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" @click="toLogout">
              <i class="iconfont icon-tubiaozhizuomoban- text-lg"></i> 登出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<style lang="scss" scoped>

</style>