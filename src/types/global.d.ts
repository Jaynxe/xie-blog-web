// 为了让document使用startViewTransition方法
interface Document {
    startViewTransition?: (callback: () => void) => ViewTransition;
}

interface ViewTransition {
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    finished: Promise<void>;
}
