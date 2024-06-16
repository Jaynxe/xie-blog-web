import type { UserInfo } from "@/types/define";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {

    const token = ref<string | null>(localStorage.getItem("token"));
    const scope = ref<string | null>(localStorage.getItem("scope"));
    const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
    const expiredAt = ref<number>(parseInt(localStorage.getItem("expiredAt") || '0', 10));
    const userInfo = reactive<UserInfo>({
        email: "",
        id: 0,
        ip: "",
        name: "",
        role: "",
        sex: "",
        avatar: "",
        nickName: ""
    });
    const isLogin = ref<boolean>(false)

    function setData(data: { token: string; scope: string; refresh_token: string; expiredAt: number; }) {
        const { token: newToken, scope: newScope, refresh_token: newRefreshToken, expiredAt: newExpiredAt } = data;
        token.value = newToken;
        scope.value = newScope;
        refreshToken.value = newRefreshToken;
        expiredAt.value = newExpiredAt;
        isLogin.value = true
        // 同步到 localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("scope", newScope);
        localStorage.setItem("refreshToken", newRefreshToken);
        localStorage.setItem("expiredAt", newExpiredAt.toString());
    }

    function setCheckTokenData(ui: any) {
        Object.assign(userInfo, ui)
        // 如果需要，可以同步到 localStorage
    }

    function getData() {
        return {
            token: token.value,
            scope: scope.value,
            refreshToken: refreshToken.value,
            expiredAt: expiredAt.value,
        };
    }

    function getCheckTokenData() {
        return userInfo;
    }

    function getToken() {
        return token.value;
    }

    function getScope() {
        return String(scope.value);
    }

    function getRefreshToken() {
        return refreshToken.value;
    }

    function getExpiredAt() {
        return expiredAt.value;
    }

    function deleteToken() {
        token.value = null;
        scope.value = null;
        refreshToken.value = null;
        expiredAt.value = 0;
        isLogin.value = false;

        // 从 localStorage 删除
        localStorage.removeItem("token");
        localStorage.removeItem("scope");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expiredAt");
    }

    return {
        token,
        scope,
        refreshToken,
        expiredAt,
        userInfo,
        isLogin,
        setData,
        setCheckTokenData,
        getData,
        getCheckTokenData,
        getToken,
        getScope,
        getRefreshToken,
        getExpiredAt,
        deleteToken,
    };
});
