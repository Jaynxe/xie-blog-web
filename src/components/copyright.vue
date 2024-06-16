<script setup lang="ts">
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
const company = 'Jaynex.cn'; // 替换成您的公司名称
</script>

<template>
    <div class="copyright">
        &copy; {{ currentYear }} Powered by <a href="https://github.com/Jaynxe" target="_blank">{{ company }}</a> . All
        rights reserved.
    </div>
</template>


<style scoped>
    .copyright {
        text-align: center;
        padding: 10px 0;
        font-size: 14px;
        height: 40px;

        a {
            font-weight: 700;
            color: var(--el-color-primary)
        }
    }
</style>