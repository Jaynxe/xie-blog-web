<script lang="ts" setup>
import { ref, computed, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {Lock, Promotion, Message, User} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { generateRegisterCode, registerUser } from "@/api";
import {type RegisterData} from "@/types/define";
import { errorCode } from "@/utils/errcode";

const router = useRouter();
const registerForm = reactive<RegisterData>({
  name: "",
  email: "",
  verificationCode: "",
  password: "",
  confirm_password: "",
  nick_name: "",
  sex: "",
  role:"",
});
const formRef = ref<FormInstance>();// 注册表单的实例
// 注册表单规则
const rules = reactive<FormRules<RegisterData>>({
  name: [
    { required: true, message: "请输入姓名", trigger: "blur" },
  ],
  nick_name: [
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
  confirm_password: [
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
})

// 提交按钮是否解除禁用
const canSubmit = computed(() => {
  const { email, verificationCode, password, confirm_password } =
      registerForm;
  return Boolean(email && verificationCode && password && confirm_password);
});

const countdown = ref(60);
const isButtonDisabled = ref(false); // 验证码按钮是否禁用
let timer: ReturnType<typeof setInterval> | null = null;
// 计时1分钟后才能再次获取验证码
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
    if (error.response.data.status === 1){
      showMessage(error.response.data.reason, "error");
    }else{
      showMessage(errorCode[error.response.data.status] || "未知错误", "error");
    }
  } else {
    showMessage("请求失败，请稍后再试.", "error");
  }
};
// 获取注册验证码
const getVerifyCode = async () => {
  if (isButtonDisabled.value) return;

  try {
    const res = await generateRegisterCode(registerForm.email);
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
      const res = await registerUser(registerForm);
      if (res.data.status === 0) {
        showMessage("用户注册成功", "success");
        await router.push({name: "login"});
      }
    } else {
      showMessage("请检查表单的输入", "error");
    }
  } catch (error) {
    handleError(error)
  }
};


const goBack = () => {
  router.push({ path: "/login" });
};
</script>

<template>
  <div class="register-page flex flex-col justify-center items-center h-screen ">
    <div class="register-container flex justify-center w-full max-w-lg bg-white p-5 rounded-lg">
      <div class="register-main w-4/5 flex flex-col items-center">
        <div class="form-container w-full">

          <div class="form-top flex justify-between items-center mb-5 ">
            <span class="title text-2xl font-bold text-sky-500">用户注册</span>
            <theme />
          </div>
          <el-divider />

          <el-form class="form-main w-full" :model="registerForm" :rules="rules" ref="formRef" label-width="1px" >
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
            <el-form-item prop="nick_name">
              <el-input v-model="registerForm.nick_name" placeholder="昵称" size="large">
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
              <el-row :gutter="5" class="w-full">
                <el-col :span="isButtonDisabled ? 14 : 16" class="flex items-center">
                  <el-input  v-model="registerForm.verificationCode" placeholder="验证码" size="large">
                    <template #prefix>
                      <el-icon>
                        <Message />
                      </el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="isButtonDisabled ? 10 : 8" class="flex items-center">
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
              <el-input v-model="registerForm.confirm_password" type="password" placeholder="确认密码" show-password
                size="large">
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
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
  .register-page {
    background: var(--login-bg-gradient);
  }

  .register-container {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

</style>