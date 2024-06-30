import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useCollapseStore = defineStore('collapse', () => {
    const isCollapse = ref(localStorage.getItem('isCollapse') === 'true');

    function toggleCollapse() {
        isCollapse.value = !isCollapse.value;
        localStorage.setItem('isCollapse', String(isCollapse.value)); // 实现持久化保存
    }

    return { isCollapse, toggleCollapse };
});
