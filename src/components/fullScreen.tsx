import {defineComponent, ref, onMounted, onBeforeUnmount} from 'vue';
import {ElTooltip} from 'element-plus';

export default defineComponent({
    name: 'fullScreen',
    setup() {
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

        onMounted(() => {
            const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
            events.forEach(event => document.addEventListener(event, updateFullScreenStatus));
        });

        onBeforeUnmount(() => {
            const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
            events.forEach(event => document.removeEventListener(event, updateFullScreenStatus));
        });

        return () => (
            <div>
                {isFullscreen.value ? (
                    <div class="full-screen cursor-pointer" onClick={toggleFullScreen}>
                        <ElTooltip content="退出全屏">
                            <i class="iconfont icon-quxiaoquanping_o text-3xl"></i>
                        </ElTooltip>
                    </div>
                ) : (
                    <div class="full-screen cursor-pointer" onClick={toggleFullScreen}>
                        <ElTooltip content="进入全屏">
                            <i class="iconfont icon-quanping_o text-3xl"></i>
                        </ElTooltip>
                    </div>
                )}
            </div>
        );
    }
});
