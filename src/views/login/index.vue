<template>
  <div class="login-background">
    <Transition name="scale-fade" mode="out-in">
      <component :is="currentLoginComponent" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import LoginPassword from "./components/loginPassword.vue";
import LoginEmail from "./components/loginEmail.vue";
import ForgetPassword from "./components/forgetPassword.vue";
import Register from "./components/register.vue";
import type { LoginType } from "@/types";
import { useLoginTypeStore } from "@/stores/loginType";
const LoginTypeStore = useLoginTypeStore();
// 定义登录组件映射
const componentMap: Record<LoginType, any> = {
  password: LoginPassword,
  email: LoginEmail,
  forgetPassword: ForgetPassword,
  register: Register,
};

// 通过映射获取当前登录组件
const currentLoginComponent = computed(() => {
  return componentMap[LoginTypeStore.selectedLoginType];
});
</script>
<style lang="scss" scoped>
.login-background {
  background: var(--login-bg-gradient);
}
/* 过渡动画的样式 */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.scale-fade-enter-to,
.scale-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
