<script lang="ts" setup>
import { ref, computed, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Promotion, Message } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { generateEmailLoginCode, submitEmailLoginForm } from "@/api";
import { type EmailLogin } from "@/types";
import theme from "@/components/theme"
import { useAuthStore } from "@/stores/auth"
import { errorCode } from "@/utils/errcode";

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

})
const emailLoginForm = reactive<EmailLogin>({
  email: "",
  verificationCode: "",
});
// 处理错误逻辑
const handleError = (error: any) => {
  if (error.response && error.response.data && error.response.data.status) {
    if (error.response.data.status === 1){
      showMessage(error.response.data.reason, "error");
    }else{
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
const canSubmit = computed(() => {
  const { email, verificationCode } =
      emailLoginForm;
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
  } catch (error:any) {
    handleError(error)
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
        await router.push({path: "/admin"});
      }
    } else {
      showMessage("请检查表单的输入", "error");
    }
  } catch (error:any) {
    handleError(error)
  }
};


const goBack = () => {
  router.push({ path: "/login" });
};
</script>

<template>
  <div class="email-login-page h-screen flex flex-col justify-center items-center">
    <div class="login-container w-1/3 flex justify-center bg-white py-10 rounded-3xl">
      <div class="login-main w-5/6 flex flex-col items-center ">
        <div class="form-container w-full">

          <div class="form-top flex justify-between items-center mb-5">
            <span class="title text-2xl text-blue-400 font-bold">邮箱登录</span>
              <theme />
          </div>
          <el-divider />

          <el-form :model="emailLoginForm"
                   :rules="rules"
                   ref="formRef"
                   label-width="1px"
                   class="form-main w-full">
            <el-form-item prop="email">
              <el-input v-model="emailLoginForm.email" placeholder="邮箱" size="large">
                <template #prefix>
                  <el-icon>
                    <Promotion />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="verificationCode">
              <el-row :gutter="5" class="w-full">
                <el-col :span="isButtonDisabled ? 14 : 16">
                  <el-input class="w-full" v-model="emailLoginForm.verificationCode" placeholder="验证码" size="large">
                    <template #prefix>
                      <el-icon>
                        <Message />
                      </el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="isButtonDisabled ? 10 : 8">
                  <el-button class="w-full" type="primary" :disabled="isButtonDisabled" @click="getVerifyCode" size="large">
                    {{
                      isButtonDisabled
                        ? `${countdown}秒后重新获取`
                        : "获取验证码"
                    }}
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item>
              <el-button class="w-full" type="primary" :disabled="!canSubmit" @click="submitForm(formRef)" size="large">确定</el-button>
            </el-form-item>
            <el-form-item>
              <el-button class="w-full" @click="goBack" size="large">返回</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .email-login-page {
    background: var(--login-bg-gradient);
  }
  .login-container {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

</style>