<template>
  <div class="container mx-auto p-4">
    <el-card class="mb-4">
      <h1 class="text-4xl font-bold mb-2">{{ siteInfo.name }}</h1>
      <p class="text-xl text-gray-600">{{ siteInfo.tagline }}</p>
    </el-card>

    <el-card class="mb-4">
      <h2 class="text-2xl font-semibold mb-2">Description</h2>
      <p>{{ siteInfo.description }}</p>
    </el-card>

    <el-card class="mb-4">
      <h2 class="text-2xl font-semibold mb-2">Author</h2>
      <p>Name: {{ siteInfo.authorName }}</p>
      <p>Bio: {{ siteInfo.bio }}</p>
    </el-card>

    <el-card class="mb-4">
      <h2 class="text-2xl font-semibold mb-2">Contact</h2>
      <p>Email: <a :href="'mailto:' + siteInfo.email" class="text-blue-600">{{ siteInfo.email }}</a></p>
      <p>Phone: {{ siteInfo.phone }}</p>
      <p>Address:</p>
      <pre>{{ siteInfo.address }}</pre>
    </el-card>

    <el-card class="mb-4">
      <h2 class="text-2xl font-semibold mb-2">Links</h2>
      <p>GitHub: <a :href="siteInfo.github" target="_blank" class="text-blue-600">{{ siteInfo.github }}</a></p>
      <p>Gitee: <a :href="siteInfo.gitee" target="_blank" class="text-blue-600">{{ siteInfo.gitee }}</a></p>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { getSiteInfo } from '@/api'
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

const siteInfo = reactive({
  name: '',
  tagline: '',
  description: '',
  url: '',
  authorName: '',
  bio: '',
  github: '',
  gitee: '',
  email: '',
  phone: '',
  address: ''
});

const toSiteInfo = async () => {
  const token = authStore.token as string
  try {
    const res = await getSiteInfo(token)
    if (res.data.status === 0) {
      ElMessage({
        message: res.data.message || '获取站点信息成功',
        type: 'success',
        duration: 3000,
      });
      Object.assign(siteInfo,res.data.data)
    } else {
      ElMessage({
        message: res.data.message || '获取站点信息失败',
        type: 'error',
        duration: 3000,
      });
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      const errorMessage = e.response?.data?.msg || 'An error occurred during getSiteInfo.';
      ElMessage({
        message: errorMessage || '发生错误！',
        type: 'error',
      });
    } else {
      ElMessage({
        message: '获取站点信息时发生未知错误。',
        type: 'error',
      });
    }
  }

}
onMounted(() => {
  toSiteInfo()
})
</script>

<style scoped>
  .container {
    width: 100%;
  }
</style>
