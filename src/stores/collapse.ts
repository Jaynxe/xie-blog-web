import { ref } from 'vue';
import { defineStore } from 'pinia';

/* 存储侧边栏缩放的状态 */
export const useCollapseStore = defineStore('collapse', () => {
    // 初始默认为 false，即为展开状态
    const isCollapse = ref(false);

    // 切换侧边栏状态的函数
    function toggleCollapse() {
        isCollapse.value = !isCollapse.value;
    }

    return { isCollapse, toggleCollapse };
});
