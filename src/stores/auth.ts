import type { UserInfo } from "@/types";
import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const useAuthStore = defineStore("auth", () => {
    // 定义状态变量
    const token = ref<string | null>(localStorage.getItem("token"));
    const scope = ref<string | null>(localStorage.getItem("scope"));
    const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
    const expired_at = ref<number>(parseInt(localStorage.getItem("expiredAt") || '0', 10));
    const userInfo = reactive<UserInfo>({
        email: "",
        id: 0,
        ip: "",
        name: "",
        role: "",
        sex: "",
        avatar: "",
        nick_name: ""
    });
    const rememberMe = ref<boolean>(localStorage.getItem("rememberMe") === "true");

    // 设置数据并同步到localStorage
    function setData(data: { token: string; scope: string; refresh_token: string; expired_at: number; }) {
        const { token: newToken, scope: newScope, refresh_token: newRefreshToken, expired_at: newExpiredAt } = data;
        token.value = newToken;
        scope.value = newScope;
        refreshToken.value = newRefreshToken;
        expired_at.value = newExpiredAt;

        // 同步到 localStorage 实现信息持久化保存
        localStorage.setItem("token", newToken);
        localStorage.setItem("scope", newScope);
        localStorage.setItem("refreshToken", newRefreshToken);
        localStorage.setItem("expiredAt", newExpiredAt.toString());
    }

    // 设置用户信息
    function setCheckTokenData(ui: Partial<UserInfo>) {
        Object.assign(userInfo, ui);
        // 如果需要，可以同步到 localStorage
    }

    // 获取存储的数据
    function getData() {
        return {
            token: token.value,
            scope: scope.value,
            refreshToken: refreshToken.value,
            expiredAt: expired_at.value,
        };
    }

    // 获取用户信息
    function getCheckTokenData() {
        return userInfo;
    }

    // 获取 token
    function getToken() {
        return token.value;
    }

    // 获取 scope
    function getScope() {
        return String(scope.value);
    }

    // 获取 refresh token
    function getRefreshToken() {
        return refreshToken.value;
    }

    // 获取 token 过期时间
    function getExpiredAt() {
        return expired_at.value;
    }

    // 删除 token 及相关数据
    function deleteToken() {
        token.value = null;
        scope.value = null;
        refreshToken.value = null;
        expired_at.value = 0;
        rememberMe.value = false;

        // 从 localStorage 删除
        localStorage.removeItem("token");
        localStorage.removeItem("scope");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expiredAt");
        localStorage.removeItem("rememberMe");
        sessionStorage.removeItem("tabs");
    }

    return {
        token,
        scope,
        refreshToken,
        expired_at,
        userInfo,
        rememberMe,
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