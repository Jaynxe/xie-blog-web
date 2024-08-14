<script lang="ts" setup>
import {ref, computed, reactive} from "vue";
import {ElMessage, type FormInstance, type FormRules} from "element-plus";
import {Lock, Promotion, Message} from "@element-plus/icons-vue";
import theme from "@/components/theme"
import {generateResetPasswordCode, submitResetPasswordForm} from "@/api";
import {type ResetPassword} from "@/types";
import {errorCode} from "@/utils/errcode";
import { useLoginTypeStore } from "@/stores/loginType";
const loginTypeStore = useLoginTypeStore();

const resetPasswordForm = reactive<ResetPassword>({
  email: "",
  verificationCode: "",
  new_password: "",
  confirm_password: "",
});
const formRef = ref<FormInstance>();
const rules = reactive<FormRules<ResetPassword>>({
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {type: "email", message: "请输入有效的邮箱地址", trigger: "blur"},
  ],
  verificationCode: [
    {required: true, message: "请输入验证码", trigger: "blur"},
  ],
  new_password: [{required: true, message: "请输入新密码", trigger: "blur"}],
  confirm_password: [
    {required: true, message: "请确认新密码", trigger: "blur"},
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.new_password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
})

const showMessage = (message: string, type: 'success' | 'warning' | 'info' | 'error') => {
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
const canSubmit = computed(() => {
  const {email, verificationCode, new_password, confirm_password} =
      resetPasswordForm;
  return Boolean(email && verificationCode && new_password && confirm_password);
});

const countdown = ref(60);
const isButtonDisabled = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;
/* 获取重置密码验证码 */
const getVerifyCode = async () => {
  if (isButtonDisabled.value) return;

  try {
    const res = await generateResetPasswordCode(resetPasswordForm.email);
    if (res.data.status === 0) {
      showMessage("验证码获取成功", "success");
      startCountdown();
    }
  } catch (error: any) {
    handleError(error)
  }
};

/* 用于获取验证码按钮的计时 */
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

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return; // 如果 formEl 不存在，直接返回，不执行后续逻辑

  try {
    const valid = await new Promise<boolean>((resolve) => {
      formEl?.validate((valid) => {
        resolve(valid);
      });
    });

    if (valid) {
      const res = await submitResetPasswordForm(resetPasswordForm);
      if (res.data.status === 0) {
        showMessage("密码重置成功", "success");
        goBack();
      }
    } else {
      showMessage("请检查表单的输入", "error");
    }
  } catch (error: any) {
    handleError(error)
  }
};


const goBack = () => {
  loginTypeStore.toggleLoginType('password')
};
</script>

<template>
  <div class="reset-password-page h-screen flex flex-col justify-center items-center ">
    <div class="reset-container w-1/3 flex justify-center bg-white py-10 rounded-3xl">
      <div class="reset-main w-5/6 flex flex-col items-center">
        <div class="form-container w-full">
          <div class="form-top flex justify-between items-center mb-5">
            <span class="title text-2xl text-blue-400 font-bold">重置密码</span>
            <theme/>
          </div>
          <el-divider/>
          <el-form :model="resetPasswordForm" :rules="rules" ref="formRef"
                   class="form-main w-full">
            <el-form-item prop="email">
              <el-input v-model="resetPasswordForm.email" placeholder="邮箱" size="large" clearable>
                <template #prefix>
                  <el-icon>
                    <Promotion/>
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="verificationCode">
              <el-row :gutter="5" class="w-full">
                <el-col :span="isButtonDisabled ? 14 : 16" class="flex items-center">
                  <el-input v-model="resetPasswordForm.verificationCode" placeholder="验证码" size="large" clearable>
                    <template #prefix>
                      <el-icon>
                        <Message/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="isButtonDisabled ? 10 : 8" class="flex items-center">
                  <el-button class="w-full" type="primary" :disabled="isButtonDisabled" @click="getVerifyCode"
                             size="large">
                    {{
                      isButtonDisabled
                          ? `${countdown}秒后重新获取`
                          : "获取验证码"
                    }}
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item prop="new_password">
              <el-input v-model="resetPasswordForm.new_password" type="password" placeholder="密码" show-password
                        size="large" clearable>
                <template #prefix>
                  <el-icon>
                    <Lock/>
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="confirm_password">
              <el-input v-model="resetPasswordForm.confirm_password" type="password" placeholder="确认密码"
                        show-password size="large" clearable>
                <template #prefix>
                  <el-icon>
                    <Lock/>
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button class="login-button w-full" type="primary" :disabled="!canSubmit" @click="submitForm(formRef)"
                         size="large">确定
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-button class="w-full" @click="goBack" size="large">返回</el-button>
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

.reset-container {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
