<script setup lang='ts'>
import "@/types/global.d.ts";
import {
  Expand,
  Fold,
} from "@element-plus/icons-vue";
import { useCollapseStore } from '@/stores/collapse';
import { useRouter } from "vue-router";
import { ref, reactive } from "vue";
import { type MenuItem } from "@/types/define";

const collapseStore = useCollapseStore();
const router = useRouter();

const active = ref("1");

const menuList = reactive<MenuItem[]>([
  {
    index: '1',
    title: '后台首页',
    icon: 'homeFilled',
    name: 'adminHome', // 跳转路由
  },
  {
    index: '2',
    title: '文章管理',
    icon: 'document',
    name: 'articleManage', // 跳转路由
    children: [
      { index: '2-1', title: '编程技术', icon: 'Monitor', name: 'program' },
      { index: '2-2', title: '摄影记录', icon: 'Camera', name: 'photography' },
      { index: '2-3', title: '生活随笔', icon: 'Money', name: 'live' },
    ],
  },
  { index: '3', title: '用户管理', icon: 'user', name: 'userManage' },
  {
    index: '4',
    title: '个人中心',
    icon: 'avatar',
    name: '',
    children: [
      { index: '4-1', title: '用户信息', icon: 'postcard', name: 'userInfo' },
      { index: '4-2', title: '我的发布', icon: 'notebook', name: 'userPost' },
      { index: '4-3', title: '我的收藏', icon: 'collection', name: 'userCollection' },
    ],
  },
  { index: '5', title: '站点信息', icon: 'setting', name: 'siteInfo' },
]);

/* 路由跳转函数 */
function jumpRoute(name: string) {
  router.push({
    name: name
  });

}
</script>

<template>
  <el-aside :width="collapseStore.isCollapse ? '64px' : '200px'">
    <!-- 侧边导航菜单 -->
    <el-menu :default-active="active" class="el-menu-vertical-demo" :collapse="collapseStore.isCollapse" unique-opened>
      <!-- 遍历一级菜单 -->
      <template v-for="item in menuList" :key="item.index">
        <!-- 判断是否有二级菜单 -->
        <el-sub-menu v-if="item.children" :index="item.index">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span v-if="!collapseStore.isCollapse">{{ item.title }}</span>
          </template>
          <!-- 遍历二级菜单项 -->
          <el-menu-item v-for="subItem in item.children" :index="subItem.index" :key="subItem.index"
            @click="jumpRoute(subItem.name)">
            <el-icon>
              <component :is="subItem.icon" />
            </el-icon>
            {{ subItem.title }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 没有二级菜单 -->
        <el-menu-item v-else :index="item.index" @click="jumpRoute(item.name)">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span v-if="!collapseStore.isCollapse">{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 切换侧边栏缩放 -->
    <div :class="['toggle-button-container']"
      :style="{ justifyContent: collapseStore.isCollapse ? 'center' : 'flex-end' }" class="toggle-button-container">
      <el-tooltip content="折叠" placement="bottom" v-if="!collapseStore.isCollapse">
        <div class="toggle-button" @click="collapseStore.toggleCollapse">
          <el-icon size="20px">
            <Fold />
          </el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="展开" placement="bottom" v-else>
        <div class="toggle-button" @click="collapseStore.toggleCollapse">
          <el-icon size="20px">
            <Expand />
          </el-icon>
        </div>
      </el-tooltip>
    </div>
  </el-aside>
</template>


<style lang="scss" scoped>

  /* 侧边栏样式 */
  .el-aside {
    transition: width 0.3s;
    position: relative;
    height: calc(100vh - 60px);
    overflow: hidden;
    transition: width 0.25s;
    -webkit-transition: width 0.25s;
    -moz-transition: width 0.25s;
    -o-transition: width 0.25s;
    // &.collapse {
    //   width: 64px;
    // }

    // &:not(.collapse) {
    //   width: 200px;
    // }
  }

  /* 切换侧边栏缩放的按钮的样式 */
  .toggle-button-container {
    position: absolute;
    right: 0;
    bottom: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.6s;

    // &.icollapse {
    //   justify-content: center;
    // }

    // &:not(.collapse) {
    //   justify-content: flex-end;
    // }

    .toggle-button {
      cursor: pointer;
      margin-right: 10px;
    }
  }

  /* 侧边导航菜单样式 */
  .el-menu-vertical-demo {
    transition: all 0.3s;
    border-right: none;
    padding-right: 4px;

    &.el-menu--collapse {
      width: 64px;
    }

    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }


</style>
