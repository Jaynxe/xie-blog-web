// stores/loginType.ts
import { defineStore } from 'pinia';
import type { LoginType } from '@/types';

export const useLoginTypeStore = defineStore('loginType', {
  state: () => ({
    selectedLoginType: 'password' as LoginType,
  }),
  actions: {
    toggleLoginType(loginType: LoginType) {
      this.selectedLoginType = loginType;
    },
  },
  persist: {
    storage: localStorage,
    paths: ['selectedLoginType'],
  },
});
