<script lang="ts" setup>
import { ref, computed, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Promotion, Message } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { generateEmailLoginCode, submitEmailLoginForm } from "@/api";
import { type EmailLogin } from "@/types";
import theme from "@/components/theme";
import { useAuthStore } from "@/stores/auth";
import { errorCode } from "@/utils/errcode";
import { useLoginTypeStore } from "@/stores/loginType";
const loginTypeStore = useLoginTypeStore();
const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const rules = reactive<FormRules<EmailLogin>>({
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  verificationCode: [
    { required: true, message: "请输入验证码", trigger: "blur" },
  ],
});
const emailLoginForm = reactive<EmailLogin>({
  email: "",
  verificationCode: "",
});
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
const canSubmit = computed(() => {
  const { email, verificationCode } = emailLoginForm;
  return Boolean(email && verificationCode);
});

const countdown = ref(60);
const isButtonDisabled = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;
const startCountdown = () => {
  isButtonDisabled.value = true;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer!);
      isButtonDisabled.value = false;
      countdown.value = 60;
    }
  }, 1000);
};

const getVerifyCode = async () => {
  if (isButtonDisabled.value) return;

  try {
    const res = await generateEmailLoginCode(emailLoginForm.email);
    if (res.data.status === 0) {
      showMessage("验证码获取成功", "success");
      startCountdown();
    }
  } catch (error: any) {
    handleError(error);
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return; // 如果 formEl 不存在，直接返回，不执行后续逻辑

  try {
    const valid = await new Promise<boolean>((resolve) => {
      formEl?.validate((valid) => {
        resolve(valid);
      });
    });

    if (valid) {
      const res = await submitEmailLoginForm(emailLoginForm);
      if (res.data.status === 0) {
        showMessage("邮箱登陆成功", "success");
        authStore.setData(res.data.data);
        // 获取重定向路径
        const redirectPath = router.currentRoute.value.query.redirect || "/admin";
        // 跳转到指定路径
        await router.push({ path: redirectPath as string });
      }
    } else {
      showMessage("请检查表单的输入", "error");
    }
  } catch (error: any) {
    handleError(error);
  }
};

const goBack = () => {
  loginTypeStore.toggleLoginType("password");
};
</script>

<template>
  <div
    class="email-login-page h-screen flex flex-col justify-center items-center"
  >
    <div
      class="login-container w-1/3 flex justify-center bg-white py-10 rounded-3xl"
    >
      <div class="login-main w-5/6 flex flex-col items-center">
        <div class="form-container w-full">
          <div class="form-top flex justify-between items-center mb-5">
            <span class="title text-2xl text-blue-400 font-bold">邮箱登录</span>
            <theme />
          </div>
          <el-divider />

          <el-form
            :model="emailLoginForm"
            :rules="rules"
            ref="formRef"
            label-width="1px"
            class="form-main w-full"
          >
            <el-form-item prop="email" class="form-item-spacing">
              <el-input
                v-model="emailLoginForm.email"
                placeholder="邮箱"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon>
                    <Promotion />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="verificationCode" class="form-item-spacing">
              <el-row :gutter="5" class="w-full">
                <el-col :span="isButtonDisabled ? 14 : 16">
                  <el-input
                    class="w-full"
                    v-model="emailLoginForm.verificationCode"
                    placeholder="验证码"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon>
                        <Message />
                      </el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="isButtonDisabled ? 10 : 8">
                  <el-button
                    class="w-full"
                    type="primary"
                    :disabled="isButtonDisabled"
                    @click="getVerifyCode"
                    size="large"
                  >
                    {{
                      isButtonDisabled
                        ? `${countdown}秒后重新获取`
                        : "获取验证码"
                    }}
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item class="form-item-spacing">
              <el-button
                class="login-button w-full py-2 bg-blue-500 text-white text-lg rounded hover:bg-blue-600 disabled:bg-gray-300"
                type="primary"
                :disabled="!canSubmit"
                @click="submitForm(formRef)"
                size="large"
                >确定
              </el-button>
            </el-form-item>
            <el-form-item class="form-item-spacing">
              <el-button class="w-full" @click="goBack" size="large"
                >返回</el-button
              >
            </el-form-item>
          </el-form>
        </div>
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
.login-container {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.form-item-spacing {
  margin-bottom: 24px; // 控制表单项之间的间隔，具体值可以根据你的需求调整
}
</style>
