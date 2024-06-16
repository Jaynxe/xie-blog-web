<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-main">
        <div class="form-container">
          <div class="form-top">
            <div class="title">用户注册</div>
            <div class="right">
              <theme />
            </div>
          </div>
          <el-divider />
          <el-form :model="registerForm" :rules="rules" ref="formRef" label-width="1px" class="register-form">
            <el-form-item prop="sex">
              <el-radio-group v-model="registerForm.sex" size="large">
                <el-radio-button :value="'男'" label="男" />
                <el-radio-button :value="'女'" label="女" />
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="name">
              <el-input v-model="registerForm.name" placeholder="姓名" size="large">
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="nickName">
              <el-input v-model="registerForm.nickName" placeholder="昵称" size="large">
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="email">
              <el-input v-model="registerForm.email" placeholder="邮箱" size="large">
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
                  <el-input v-model="registerForm.verificationCode" placeholder="验证码" size="large">
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
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="密码" show-password size="large">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" show-password
                size="large">
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
import { generateRegisterCode, submitRegisterForm } from "@/api";
import { type RegisterDate } from "@/types/define";
import { errorCode } from "@/utils/errcode";

const router = useRouter();

const formRef = ref<FormInstance>();
const registerForm = reactive<RegisterDate>({
  name: "",
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
  nickName: "",
  sex: "",
});

const rules: FormRules = {
  name: [
    { required: true, message: "请输入姓名", trigger: "blur" },
  ],
  nickName: [
    { required: true, message: "请输入昵称", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  verificationCode: [
    { required: true, message: "请输入验证码", trigger: "blur" },
  ],
  password: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
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
  const { email, verificationCode, password, confirmPassword } =
    registerForm;
  return Boolean(email && verificationCode && password && confirmPassword);
});

const countdown = ref(60);
const isButtonDisabled = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const getVerifyCode = async () => {
  if (isButtonDisabled.value) return;

  generateRegisterCode(registerForm.email)
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
      if (error.response.data.status === 1) {
        ElMessage({
          message: "验证码获取失败",
          type: "error",
          duration: 3000,
        });
      }
    });
};

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
    submitRegisterForm(registerForm)
      .then((res) => {
        if (res.data.status === 0) {
          ElMessage({
            message: "用户注册成功",
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
  .register-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: var(--login-bg-gradient);
  }

  .register-container {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 500px;
    background-color: #fff;
    padding: 20px;
    border-radius: 40px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .register-main {
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
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

  .register-form {
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