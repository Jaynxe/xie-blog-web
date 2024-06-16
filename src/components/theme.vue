<script setup lang='ts'>
import { useDark, useToggle } from "@vueuse/core";
import {
  Moon,
  Sunny,
} from "@element-plus/icons-vue"
/* start——暗黑模式 */
const isDark = useDark({
  disableTransition: false,
  valueDark: "dark",
  valueLight: "light",
});
const toggleDark = useToggle(isDark),
  toggleTheme = (event: { clientX: any; clientY: any; }) => {
    // 浏览器兼容性检查
    if (!document.startViewTransition) {
      isDark.value = !isDark.value
      toggleDark()
      return
    }

    const x = event.clientX,
      y = event.clientY,
      endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
      )
    const transition = document.startViewTransition(async () => {
      const root = document.documentElement
      root.classList.add(isDark.value ? "light" : "dark")
      root.classList.remove(isDark.value ? "dark" : "light")
      toggleDark()

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        document.documentElement.animate(
          {
            clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 400,
            easing: "ease-in",
            pseudoElement: isDark.value
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        )
      })
    })
    isDark.value = !isDark.value
  }
/* End——暗黑模式 */

</script>

<template>
  <el-switch v-model="isDark" :style="{ marginRight: '10px' }" :active-action-icon="Moon" :inactive-action-icon="Sunny"
    active-color="#6b6d71" @click="toggleTheme" />
</template>

<style scoped></style>