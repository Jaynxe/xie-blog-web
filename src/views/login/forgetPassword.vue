<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <div class="reset-main">
        <div class="form-container">
          <div class="form-top">
            <div class="title">重置密码</div>
            <div class="right">
              <theme />
            </div>
          </div>
          <el-divider />
          <el-form :model="resetPasswordForm" :rules="rules" ref="formRef" label-width="1px"
            class="reset-password-form">
            <el-form-item prop="email">
              <el-input v-model="resetPasswordForm.email" placeholder="邮箱" size="large">
                <template #prefix>
                  <el-icon>
                    <Promotion />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="verificationCode">
              <el-row :gutter="5">
                <el-col :span="isButtonDisabled ? 14 : 16">
                  <el-input v-model="resetPasswordForm.verificationCode" placeholder="验证码" size="large">
                    <template #prefix>
                      <el-icon>
                        <Message />
                      </el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="isButtonDisabled ? 10 : 8">
                  <el-button type="primary" :disabled="isButtonDisabled" @click="getVerifyCode" size="large">
                    {{
                      isButtonDisabled
                        ? `${countdown}秒后重新获取`
                        : "获取验证码"
                    }}
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item prop="newPassword">
              <el-input v-model="resetPasswordForm.newPassword" type="password" placeholder="密码" show-password size="large">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input v-model="resetPasswordForm.confirmPassword" type="password" placeholder="确认密码" show-password size="large">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>   
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!canSubmit" @click="submitForm" size="large">确定</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="default" @click="goBack" size="large">返回</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Lock, Promotion, Message } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { generateResetPasswordCode, submitResetPasswordForm } from "@/api";
import { type ResetPassword } from "@/types/define";
import { errorCode } from "@/utils/errcode";

const router = useRouter();

const formRef = ref<FormInstance>();
const resetPasswordForm = reactive<ResetPassword>({
  email: "",
  verificationCode: "",
  newPassword: "",
  confirmPassword: "",
});

const rules: FormRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  verificationCode: [
    { required: true, message: "请输入验证码", trigger: "blur" },
  ],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const canSubmit = computed(() => {
  const { email, verificationCode, newPassword, confirmPassword } =
    resetPasswordForm;
  return Boolean(email && verificationCode && newPassword && confirmPassword);
});

const countdown = ref(60);
const isButtonDisabled = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;
/* 获取重置密码验证码 */
const getVerifyCode = async () => {
  if (isButtonDisabled.value) return;

  generateResetPasswordCode(resetPasswordForm.email)
    .then((res) => {
      if (res.data.status === 0) {
        ElMessage({
          message: "验证码获取成功",
          type: "success",
          duration: 3000,
        });
        startCountdown();
      }
    })
    .catch((error) => {
      console.log(error)
      if (error.response.data.status === 5) {
          ElMessage({
            message: errorCode[error.response.data.status],
            type: "error",
            duration: 3000,
          });
        }
      if (error.response.data.status === 1) {
        ElMessage({
          message: "验证码获取失败",
          type: "error",
          duration: 3000,
        });
      }
    });
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

const submitForm = async () => {
  const isValid = await formRef.value?.validate();
  if (isValid) {
    submitResetPasswordForm(resetPasswordForm)
      .then((res) => {
        if (res.data.status === 0) {
          ElMessage({
            message: "密码重置成功",
            type: "success",
            duration: 3000,
          });
          router.push({ name: "login" });
        }
      })
      .catch((error) => {
          ElMessage({
            message: errorCode[error.response.data.status],
            type: "error",
            duration: 3000,
          });
        // 服务器内部错误
        if (error.response.data.status === 1) {
          ElMessage({
            message: error.response.data.reason,
            type: "error",
            duration: 3000,
          });
        }
      
      });
  } else {
    ElMessage.error("请检查表单的输入");
  }
};

const goBack = () => {
  router.push({ path: "/login" });
};
</script>

<style lang="scss" scoped>
  .reset-password-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: var(--login-bg-gradient);
  }

  .reset-container {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 500px;
    background-color: #fff;
    padding: 20px;
    border-radius: 40px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .reset-main {
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 20px;
  }

  .form-container {
    width: 100%;
  }

  .form-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 24px;
    color: var(--el-color-primary);
    letter-spacing: 1px;
    font-weight: bold;
    margin-bottom: 20px;

    .title {
      font-size: 24px;
      font-weight: bold;
      color: #2575fc;
    }
  }

  .reset-password-form {
    width: 100%;
  }

  .el-row {
    width: 100%;
  }

  .el-col {
    display: flex;
    align-items: center;
  }

  .el-button {
    width: 100%;
  }
</style>
