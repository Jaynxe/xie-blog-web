// stores/collapse.ts
import {defineStore} from 'pinia';

export const useCollapseStore = defineStore('collapse', {
    state: () => ({
        isCollapse: localStorage.getItem('isCollapse') === 'true',
    }),
    actions: {
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
        },
    },
    persist: {
        storage: localStorage,
    },
});
