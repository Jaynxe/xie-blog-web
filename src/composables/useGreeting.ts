import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";

export function useGreeting() {
  const authStore = useAuthStore();

  const greet = computed(() => {
    const hours = new Date().getHours();
    const name = authStore.userInfo.name;
    if (hours >= 5 && hours < 9) {
      return `早上好,${name},今天又是充满活力的一天!`;
    } else if (hours >= 9 && hours < 12) {
      return `上午好,${name},保持元气满满哦!`;
    } else if (hours >= 12 && hours < 14) {
      return `中午好,${name},记得吃午饭哦!`;
    } else if (hours >= 14 && hours < 18) {
      return `下午好,${name},今天的工作顺利吗?`;
    } else if (hours >= 18 && hours < 21) {
      return `傍晚好,${name},工作辛苦了,放松一下吧!`;
    } else if (hours >= 21 && hours < 23) {
      return `晚上好,${name},今天过得怎么样?`;
    } else {
      return `夜深了,${name},该休息了,晚安!`;
    }
  });

  return { greet };
}
