<script lang="ts" setup>
import {ref, reactive, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import {getSiteInfo, updateSiteInfo} from '@/api';
import {useAuthStore} from "@/stores/auth";

const authStore = useAuthStore();
const productionDependencies = [
  {package: "@element-plus/icons-vue", version: "2.3.1"},
  {package: "@vueuse/core", version: "10.9.0"},
  {package: "@vueuse/shared", version: "10.9.0"},
  {package: "axios", version: "1.7.2"},
  {package: "dayjs", version: "1.11.11"},
  {package: "echarts", version: "5.5.0"},
  {package: "element-plus", version: "2.7.3"},
  {package: "less", version: "4.2.0"},
  {package: "nprogress", version: "0.2.0"},
  {package: "pinia", version: "2.1.7"},
  {package: "vue", version: "3.4.27"},
  {package: "vue-router", version: "4.3.2"},
  {package: "tailwindcss", version: "3.4.3"}
];

const developmentDependencies = [
  {package: "@rushstack/eslint-patch", version: "1.10.3"},
  {package: "@tsconfig/node20", version: "20.1.4"},
  {package: "@types/node", version: "20.12.12"},
  {package: "@types/nprogress", version: "0.2.3"},
  {package: "@vitejs/plugin-vue", version: "5.0.4"},
  {package: "@vitejs/plugin-vue-jsx", version: "3.1.0"},
  {package: "@vue/eslint-config-typescript", version: "13.0.0"},
  {package: "@vue/tsconfig", version: "0.5.1"},
  {package: "autoprefixer", version: "10.4.19"},
  {package: "eslint", version: "8.57.0"},
  {package: "eslint-plugin-vue", version: "9.26.0"},
  {package: "npm-run-all2", version: "6.2.0"},
  {package: "postcss", version: "8.4.38"},
  {package: "sass", version: "1.77.2"},
  {package: "unplugin-auto-import", version: "0.17.6"},
  {package: "unplugin-icons", version: "0.19.0"},
  {package: "unplugin-vue-components", version: "0.27.0"},
  {package: "vite", version: "5.2.11"},
  {package: "vite-plugin-inspect", version: "0.8.4"},
  {package: "vue-tsc", version: "2.0.19"}
];

/* 站点信息 */
const siteInfo = reactive({
  name: '',
  description: '',
  author_name: '',
  github: '',
  email: '',
  phone: '',
  address: ''
});

const labels = reactive({
  name: '站点名称',
  description: '描述',
  author_name: '作者名',
  github: 'GitHub',
  email: '邮箱',
  phone: '电话',
  address: '地址'
});

// 当前修改的字段和标签
const currentKey = ref<keyof typeof siteInfo | null>(null);
const currentLabel = ref<string>("");
const currentField = reactive<{ [key in keyof typeof siteInfo]?: string }>({});

// 弹出框可见状态
const dialogVisible = ref(false);

const modifyInfo = (key: keyof typeof siteInfo) => {
  currentKey.value = key;
  currentLabel.value = labels[key] + ":";
  currentField[key] = siteInfo[key];
  dialogVisible.value = true;
};
// 显示消息提示
const showMessage = (message: string, type: 'success' | 'warning' | 'info' | 'error') => {
  ElMessage({
    message,
    type,
    duration: 3000,
  });
};

// 获取站点信息
const toSiteInfo = async () => {
  try {
    const res = await getSiteInfo();
    if (res.data.status === 0) {
      // showMessage(res.data.message || '获取站点信息成功',"success")
      Object.assign(siteInfo, res.data.data);
    }
  } catch (error) {
    showMessage("获取站点信息失败", "error")
  }
};

// 修改站点信息
const saveInfo = async () => {
  if (currentKey.value !== null) {
    siteInfo[currentKey.value] = currentField[currentKey.value] as string;
  }
  try {
    const res = await updateSiteInfo(siteInfo);
    if (res.data.status === 0) {
      showMessage(res.data.message || '修改成功', "success")
      dialogVisible.value = false;
    }
  } catch (e) {
    showMessage("修改失败", "error")
  }
};

onMounted(() => {
  toSiteInfo();
});
</script>

<template>
  <div class="site-container w-full flex flex-col gap-2.5">
    <div class="site-about w-full">
      <el-card shadow="hover" class="p-1.5">
        <template #header>
          <div class="card-header">
            <span style="font-size: 20px;font-weight: 600;">关于</span>
          </div>
        </template>
        <p>
          <b style="color: #00aaff;">xie-blog-admin</b> 是一个博客后台管理系统, 基于最新的前端技术栈，包括Vue3, Vite5,
          TypeScript,
          Pinia, element-plus组件库 和 tailwindcss。它内置了丰富的主题配置和组件, 代码规范严谨。
          同时xie-blog-admin项目也是我学习前端技术的一个小小的实践,还有很多需要完善的地方。
        </p>
      </el-card>
    </div>

    <div class="site-info w-full">
      <el-card shadow="hover">
        <template #header><span style="font-size: 20px;font-weight: 600;">站点信息</span></template>
        <el-descriptions :column="1">
          <el-descriptions-item v-for="(label, key) in labels" label-class-name="site-label" :label="label" :key="key">
            <div class="info-content flex justify-between items-center">
              <span class="text-sm font-light text-gray-500 ">{{ siteInfo[key] }}</span>
              <el-button type="primary" :disabled="authStore.getScope()!=='admin' " @click="modifyInfo(key)" bg text>
                修改
              </el-button>
            </div>
            <el-divider style="margin: 5px 0;" border-style="dashed"/>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <el-dialog v-model="dialogVisible" title="修改站点信息" class="w-1/2" style="border-radius: 10px">
      <el-form :model="currentField" label-width="auto" label-position="left">
        <el-form-item :label="currentLabel">
          <el-input class="w-full" v-model="currentField[currentKey!]" placeholder="请输入"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInfo">保存</el-button>
      </template>
    </el-dialog>

    <div class="project-info w-full">
      <el-card shadow="hover">
        <template #header><span style="font-size: 20px;font-weight: 600;">项目信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label-class-name="descriptions-label" class-name="descriptions-content"
                                label="当前版本">
            <el-tag class="text-sm" size="large">1.0.0</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label-class-name="descriptions-label" class-name="descriptions-content"
                                label="Github 地址">
            <el-tag class="text-sm" size="large"><a href="https://github.com/Jaynxe/xie-blog-web"
                                                    target="_blank">点击Github链接</a></el-tag>
          </el-descriptions-item>

          <el-descriptions-item label-class-name="descriptions-label" class-name="descriptions-content"
                                label="推荐 pnpm 版本">
            <el-tag class="text-sm" size="large">>=9</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label-class-name="descriptions-label" class-name="descriptions-content"
                                label="推荐 node 版本">
            <el-tag class="text-sm" size="large">^18.18.0 || ^20.9.0 || >=21.1.0</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <div class="project-dependencies w-full flex flex-col gap-2.5">
      <el-card shadow="hover">
        <template #header>
          <span style="font-size: 20px;font-weight: 600;">生产项目依赖</span>
        </template>
        <el-descriptions :column="4" border>
          <el-descriptions-item v-for="dependency in productionDependencies" :key="dependency.package"
                                :label="dependency.package">
            <el-tag size="large">{{ dependency.version }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="hover">
        <template #header>
          <span style="font-size: 20px;font-weight: 600;">开发项目依赖</span>
        </template>
        <el-descriptions :column="4" border>
          <el-descriptions-item v-for="dependency in developmentDependencies" :key="dependency.package"
                                :label="dependency.package">
            <el-tag size="large">{{ dependency.version }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.site-container {
  .site-info {
    :deep(.site-label) {
      font-size: 16px;
      font-weight: 500;
    }
  }

  /* 项目描述的样式 */
  .project-info {
    :deep(.descriptions-label) {
      font-weight: 500;
      font-size: 16px;
    }

    :deep(.descriptions-content) {
      font-weight: 600;
    }

  }
}
</style>
