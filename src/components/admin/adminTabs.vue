<template>
  <div
    class="gvb-tabs h-12 w-full border-b border-l border-solid border-b-gray-500/20 border-l-gray-500/20"
  >
    <div class="tabs-container flex items-center justify-between">
      <div class="tabs-header">
        <el-tabs
          v-model="activeValue"
          type="card"
          @tab-remove="removeTab"
          @tab-click="changeTab"
        >
          <el-tab-pane
            v-for="item in tabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
            :closable="!item.fixed"
          >
            <template #label>
              <span
                :class="
                  activeValue === item.name ? 'text-active' : 'text-normal'
                "
              >
                {{ item.title }}
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <el-button
        @click="removeAllTabs"
        type="primary"
        plain
        class="mb-2 mr-2"
        :icon="Delete"
        >全部删除
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { TabPaneName } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

interface TabType {
  name: string;
  title: string;
  fixed?: boolean;
}

const route = useRoute();
const router = useRouter();

const defaultTabs: TabType[] = [
  { name: "adminHome", title: "首页", fixed: true },
];

const tabs = ref<TabType[]>([]);

// 激活样式所在的路由
const activeValue = ref<string>(route.name as string);

// 监听路由变化，更新 activeValue 和标签页
watch(route, (newRoute) => {
  const routeName = newRoute.name as string;
  const routeTitle = newRoute.meta.title as string;
  activeValue.value = routeName;
  addTab(routeName, routeTitle);
  saveTabsToSessionStorage();
});

// 点击标签页后进行路由跳转
const changeTab = (tab: { paneName: any }) => {
  router.push({ name: tab.paneName });
};

// 删除标签页
const removeTab = (targetName: TabPaneName) => {
  const index = tabs.value.findIndex((tab) => tab.name === targetName);

  if (index !== -1 && !tabs.value[index].fixed) {
    tabs.value.splice(index, 1);

    if (activeValue.value === targetName) {
      const newIndex = index === tabs.value.length ? index - 1 : index;
      if (newIndex >= 0) {
        activeValue.value = tabs.value[newIndex].name;
        router.push({ name: tabs.value[newIndex].name });
      }
    }
    saveTabsToSessionStorage();
  }
};

// 删除所有标签页
const removeAllTabs = () => {
  tabs.value = tabs.value.filter((tab) => tab.fixed);
  activeValue.value = tabs.value[0].name;
  router.push({ name: tabs.value[0].name });
  saveTabsToSessionStorage();
};

// 保存标签页到 sessionStorage
const saveTabsToSessionStorage = () => {
  sessionStorage.setItem("tabs", JSON.stringify(tabs.value));
};

// 从 sessionStorage 恢复标签页
const loadTabsFromSessionStorage = () => {
  const savedTabs = sessionStorage.getItem("tabs");
  if (savedTabs) {
    tabs.value = JSON.parse(savedTabs);
  } else {
    tabs.value = [...defaultTabs];
  }
};

// 添加标签页
const addTab = (name: string, title: string) => {
  if (!tabs.value.find((tab) => tab.name === name)) {
    tabs.value.push({ name, title });
  }
};

// 组件挂载时加载标签页
onMounted(() => {
  loadTabsFromSessionStorage();
  const routeName = route.name as string;
  const routeTitle = route.meta.title as string;
  if (!tabs.value.find((tab) => tab.name === routeName)) {
    addTab(routeName, routeTitle);
  }
  activeValue.value = routeName;
  saveTabsToSessionStorage();
});
</script>

<style lang="scss" scoped>
.gvb-tabs {
  .tabs-header {
    overflow-x: auto;
    white-space: nowrap;
    max-width: calc(100% - 100px); // Adjust based on your layout
  }

  ::v-deep(.el-tabs--card > .el-tabs__header) {
    border: none;
  }

  ::v-deep(.el-tabs__nav-scroll) {
    padding: 4px 4px;
  }

  ::v-deep(.el-tabs__nav) {
    border: 0;
  }

  ::v-deep(.el-tabs__header) {
    border-bottom: 0;
  }

  ::v-deep(.el-tabs__item) {
    box-sizing: border-box;
    border: 1px solid var(--el-border-color-darker);
    border-radius: 2px;
    margin-right: 5px;
    margin-left: 2px;
    margin-top: 2px;
    transition: padding 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
    height: 34px;

    &.is-active {
      border: 1px solid var(--el-color-primary);
    }
  }

  ::v-deep(.el-tabs__item):first-child {
    border: 1px solid var(--el-border-color-darker);

    &.is-active {
      border: 1px solid var(--el-color-primary);
    }
  }
}

.text-normal {
  color: var(--tab-text-color);
}
</style>
