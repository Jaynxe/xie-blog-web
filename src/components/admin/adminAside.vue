<script setup lang='ts'>
import "@/types/global.d.ts";
import {
  Expand,
  Fold,
} from "@element-plus/icons-vue";
import { useCollapseStore } from '@/stores/collapse';
import { useRouter, useRoute } from "vue-router";
import { ref, reactive, watch } from "vue";
import { type MenuItem } from "@/types/define";

const collapseStore = useCollapseStore();
const router = useRouter();
const route = useRoute();

const active = ref(route.name as string);

const menuList = reactive<MenuItem[]>([
  {
    index: '1',
    title: '后台首页',
    icon: 'House',
    name: 'adminHome', // 跳转路由
  },
  {
    index: '2',
    title: '系统管理',
    icon: 'setting',
    name: 'admin', // 跳转路由
    children: [
      { index: '2-1', title: '用户管理', icon: 'User', name: 'userManage' },
      { index: '2-2', title: '文章管理', icon: 'Notebook', name: 'articleManage' },
    ],
  },
  { index: '4', title: '关于', icon: 'InfoFilled', name: 'siteInfo' },
]);

/* 路由跳转函数 */
function jumpRoute(name: string) {
  router.push({ name });
}

// 监听路由变化，更新激活菜单项
watch(route, (newRoute) => {
  active.value = newRoute.name as string;
});

</script>

<template>
  <div class="aside-main relative overflow-hidden">
    <!-- 侧边导航菜单 -->
    <el-menu :default-active="active" class="aside-menu transition-all duration-300 ease-in-out"
             :collapse="collapseStore.isCollapse" unique-opened>
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
          <el-menu-item v-for="subItem in item.children" :index="subItem.name" :key="subItem.index"
                        @click="jumpRoute(subItem.name)">
            <el-icon>
              <component :is="subItem.icon" />
            </el-icon>
            {{ subItem.title }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 没有二级菜单 -->
        <el-menu-item v-else :index="item.name" @click="jumpRoute(item.name)">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span v-if="!collapseStore.isCollapse">{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 切换侧边栏缩放 -->
    <div  class="absolute right-1 bottom-20 w-full flex items-center transition-all duration-600 ease"
          :style="{ justifyContent: collapseStore.isCollapse ? 'center' : 'flex-end' }">
      <el-tooltip content="折叠" placement="bottom" v-if="!collapseStore.isCollapse">
        <div class="toggle-button cursor-pointer" @click="collapseStore.toggleCollapse">
          <el-icon size="20px">
            <Fold />
          </el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="展开" placement="bottom" v-else>
        <div class="toggle-button cursor-pointer" @click="collapseStore.toggleCollapse">
          <el-icon size="20px">
            <Expand />
          </el-icon>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.aside-main {
  height: calc(100vh - 60px);
}
.aside-menu{
  border-right: 0;
}
</style>
