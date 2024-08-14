import { defineComponent } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import 'element-plus/es/components/switch/style/css';
import { ElSwitch } from 'element-plus'; // 引入 Element Plus Switch 组件的样式

export default defineComponent({
    name: 'Theme',
    setup() {
        /* start——暗黑模式 */
        const isDark = useDark({
            disableTransition: false,
            valueDark: 'dark',
            valueLight: 'light',
        });
        const toggleDark = useToggle(isDark);

        const toggleTheme = () => {
            isDark.value = !isDark.value;
            toggleDark();
        };


        return () => (
            <ElSwitch
                v-model={isDark.value}
                size='large'
                active-action-icon={<i class="iconfont icon-weather-color_moon-stars"></i>}
                inactive-action-icon={<i class="iconfont icon-sun"></i>}
                inline-prompt
                onChange={toggleTheme}
            />
        );
    },
});
