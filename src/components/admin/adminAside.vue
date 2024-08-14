<script setup lang="ts">
import "@/types/global.d.ts";
import { Expand, Fold } from "@element-plus/icons-vue";
import { useCollapseStore } from "@/stores/collapse";
import { useRouter, useRoute } from "vue-router";
import { ref, reactive, computed, watch } from "vue";
import { type MenuItem } from "@/types";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const userScope = authStore.getScope();
const collapseStore = useCollapseStore();
const router = useRouter();
const route = useRoute();

const active = ref(route.name as string);

const menuList = reactive<MenuItem[]>([
  {
    index: "1",
    title: "首页",
    icon: "House",
    name: "adminHome",
    scope: ["admin", "user"],
  },
  {
    index: "2",
    title: "系统管理",
    icon: "setting",
    name: "systemManage",
    scope: ["admin"],
    children: [
      {
        index: "2-1",
        title: "用户管理",
        icon: "User",
        name: "userManage",
        scope: ["admin"],
      },
      {
        index: "2-2",
        title: "文章管理",
        icon: "Notebook",
        name: "articleManage",
        scope: ["admin"],
      },
    ],
  },
  {
    index: "4",
    title: "关于",
    icon: "InfoFilled",
    name: "about",
    scope: ["admin", "user"],
  },
]);

// Filter menu items based on user scope
const filteredMenuList = computed(() => {
  function filterMenu(items: MenuItem[]): MenuItem[] {
    return items.filter((item) => {
      if (item.children) {
        item.children = filterMenu(item.children);
      }
      return (
        item.scope.some((scope) => userScope.includes(scope)) &&
        (!item.children || item.children.length)
      );
    });
  }

  return filterMenu(menuList);
});

/* 路由跳转函数 */
function jumpRoute(item: any) {
  router.push({ name: item.name });
}

// 监听路由变化，更新激活菜单项
watch(route, (newRoute) => {
  active.value = newRoute.name as string;
});
</script>

<template>
  <div class="aside-main relative overflow-hidden">
    <!-- 侧边导航菜单 -->
    <el-menu
      :default-active="active"
      class="aside-menu transition-all duration-300 ease-in-out"
      :collapse="collapseStore.isCollapse"
      unique-opened
    >
      <!-- 遍历一级菜单 -->
      <template v-for="item in filteredMenuList" :key="item.index">
        <!-- 判断是否有二级菜单 -->
        <el-sub-menu v-if="item.children" :index="item.index">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span v-if="!collapseStore.isCollapse">{{ item.title }}</span>
          </template>
          <!-- 遍历二级菜单项 -->
          <el-menu-item
            v-for="subItem in item.children"
            :index="subItem.name"
            :key="subItem.index"
            @click="jumpRoute(subItem)"
          >
            <el-icon>
              <component :is="subItem.icon" />
            </el-icon>
            {{ subItem.title }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 没有二级菜单 -->
        <el-menu-item v-else :index="item.name" @click="jumpRoute(item)">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span v-if="!collapseStore.isCollapse">{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 切换侧边栏缩放 -->
    <div
      class="absolute right-1 bottom-10 w-full flex items-center transition-all duration-600 ease"
      :style="{
        justifyContent: collapseStore.isCollapse ? 'center' : 'flex-end',
      }"
    >
      <el-tooltip
        content="折叠"
        placement="bottom"
        v-if="!collapseStore.isCollapse"
      >
        <div
          class="toggle-button cursor-pointer"
          @click="collapseStore.toggleCollapse"
        >
          <el-icon size="22px">
            <Fold />
          </el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="展开" placement="bottom" v-else>
        <div
          class="toggle-button cursor-pointer"
          @click="collapseStore.toggleCollapse"
        >
          <el-icon size="22px">
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

.aside-menu {
  border-right: 0;
  padding: 4px 6px;
}
</style>
