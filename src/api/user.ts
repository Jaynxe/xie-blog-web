import service from "@/utils/request"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"
import type { AxiosRequestConfig } from "axios"
import type { EmailLogin, RegisterDate, ResetPassword } from "@/types/define"
const router = useRouter()
// 登录接口
export function login(username: string | string[], password: string) {
    let requestData = {}

    if (username.includes("@")) {
        requestData = { queryemail: username, password }
    } else {
        requestData = { name: username, password }
    }

    return service.post("login", requestData)
}
// 登出接口
export function logout(token: string) {
    return service.post("authrequired/user/logout", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}
// 用于刷新token
export function toRefreshToken(refreshToken: string) {
    return service.post(
        "refresh",
        {},
        {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        }
    )
}

// token校验,用于不需要获取数据但是需要校验的页面
export async function isUserLoggedIn() {
    const useAuth = useAuthStore();
    const token = useAuth.token;

    if (!token) {
        // 如果没有token，直接返回false
        console.warn("未找到令牌，用户未登录.");
        return false;
    }

    const config: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const res = await service.get("/isValid", config);
        if (res.data.status === 0) {
            useAuth.setCheckTokenData(res.data.data);
            return true; // Token is valid
        }
        console.warn("令牌验证失败，状态无效:", res.data.status);
        return false; // Invalid status
    } catch (error: any) {
        console.error("验证令牌时出错:", error);
        useAuth.deleteToken();

        // 错误码为7，无权限访问，跳转到403
        if (error.response && error.response.data && error.response.data.status === 7) {
            ElNotification({
                title: "错误",
                message: "无权限访问",
                type: "error",
                duration: 5000,
            });
            router.push({ path: "/403" });
        }

        return false; // Token is invalid
    }
}

// 生成重置密码的验证码请求
export const generateResetPasswordCode = (email: string) => {
    return service.post(`resetPassword`, { email });
};


// 提交密码重置表单
export const submitResetPasswordForm = (formData: ResetPassword) => {
    return service.post('resetPassword', formData, { withCredentials: true });
};

// 生成邮箱登录的验证码请求
export const generateEmailLoginCode = (email: string) => {
    return service.post(`loginWithEmail`, { email });
};
// 提交邮箱验证码登录表单
export const submitEmailLoginForm = (formData: EmailLogin) => {
    return service.post('loginWithEmail', formData, { withCredentials: true });
};

// 生成注册的验证码请求
export const generateRegisterCode = (email: string) => {
    return service.post(`register`, { email });
};
// 提交注册表单
export const submitRegisterForm = (formData: RegisterDate) => {
    return service.post('register', formData, { withCredentials: true });
};
//获取用户信息
export const getUserInfo = (token: string) => {
    return service.get("authrequired/user/getUserInfo",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
}