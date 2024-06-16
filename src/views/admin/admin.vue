<script lang="ts" setup>
import adminHeader from '@/components/admin/adminHeader.vue';
import adminAside from '@/components/admin/adminAside.vue';
import copyright from '@/components/copyright.vue';
</script>

<template>
  <el-container direction="vertical" class="full-height">
    <!-- 头部 -->
    <adminHeader></adminHeader>
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <adminAside></adminAside>
      <!-- 主体内容和标签页 -->
      <el-container direction="vertical" class="main-content">
        <div class="tabs"></div>
        <el-main class="main">
          <router-view />
        </el-main>
        <copyright></copyright>
      </el-container>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>

  /* 用于让el-main内容区域出现滚动条，而不是整个页面 */
  .full-height {
    height: 100vh;
  }

  .main-container {
    flex: 1;
    overflow: auto; //如果内容超出才会出现滚动条
  }

  .main-content {
    flex: 1;
    height: 100%;
  }

  .main {
    flex: 1;
    padding: 5px;
    height: 100%;
    overflow: auto;
    background-color: #f5f6f7;

    /* 隐藏滚动条 */
    scrollbar-width: none;
    /* 对Firefox */
    -ms-overflow-style: none;
    /* 对Internet Explorer and Edge */

    &::-webkit-scrollbar {
      display: none;
      /* 对WebKit（Chrome、Safari） */
    }
  }

  .tabs {
    height: 40px;
    width: 100%;
    background-color: #fff;
    border-left: 1px solid rgba(168, 168, 168, 0.2);
    border-bottom: 1px solid rgba(168, 168, 168, 0.2);
  }

</style>
