<script setup lang='ts'>
/* start-切换全屏 */
const isFullscreen = ref(Boolean(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
));

const updateFullScreenStatus = () => {
    isFullscreen.value = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
    );
};

const toggleFullScreen = () => {
    const doc = document as any;
    if (isFullscreen.value) {
        if (doc.exitFullscreen) doc.exitFullscreen();
        else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        else if (doc.msExitFullscreen) doc.msExitFullscreen();
    } else {
        const docElm = doc.documentElement;
        if (docElm.requestFullscreen) docElm.requestFullscreen();
        else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
        else if (docElm.webkitRequestFullScreen) docElm.webkitRequestFullScreen();
        else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    }
};

// 监听全屏状态变化
onMounted(() => {
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(event => document.addEventListener(event, updateFullScreenStatus));
});

onBeforeUnmount(() => {
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(event => document.removeEventListener(event, updateFullScreenStatus));
});
/* end-切换全屏 */

</script>

<template>
    <!-- <el-icon class="full-screen" @click="toggleFullScreen" size="20px">
        <FullScreen />
    </el-icon> -->
    <div v-if="isFullscreen" class="full-screen">
        <el-tooltip content="退出全屏">
            <i class="iconfont icon-quxiaoquanping_o " @click="toggleFullScreen"></i>
        </el-tooltip>
    </div>
    <div v-else class="full-screen">
        <el-tooltip content="进入全屏">
            <i class="iconfont icon-quanping_o " @click="toggleFullScreen"></i>
        </el-tooltip>
    </div>

</template>

<style scoped>
    div.full-screen {
        cursor: pointer;
        margin-right: 10px;

        i {
            font-size: 27px;
        }
    }
</style>