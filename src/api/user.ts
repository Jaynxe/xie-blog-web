import service from "@/utils/request"
import { useAuthStore } from "@/stores/auth"
import type {EmailLogin, ModifyUser, RegisterUser, ResetPassword} from "@/types"
// 登录接口
export function login(username: string | string[], password: string) {
    const requestData = { name: username, password }
    return service.post("login", requestData)
}
// 登出接口
export function logout() {
    return service.post("authrequired/user/logout",null,{
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
    const authStore = useAuthStore()
    if (!authStore.token){
        return false;
    }
    try {
        const res = await service.get("/isValid");
        if (res.data.status === 0) {
            authStore.setCheckTokenData(res.data.data);
            return true; // Token 有效
        }
    } catch (error: any) {
        // 服务器内部错误
        if(error.response.data.status === 1) {
            ElMessage({
                message:error.response.data.msg,
                type:"error",
                duration:3000,
            });
        }
        if(error.response.data.status === 2) {
            ElMessage({
                message:"登录失效,请重新登录",
                type:"warning",
                duration:3000,
            });
        }
        authStore.deleteToken();
        return false; // Token 无效
    }
}

// 生成重置密码的验证码请求
export const generateResetPasswordCode = (email: string) => {
    return service.post(`resetPassword`, { email });
};

// 提交重置密码表单
export const submitResetPasswordForm = (formData: ResetPassword) => {
    return service.post('resetPassword', formData);
};

// 生成邮箱登录的验证码请求
export const generateEmailLoginCode = (email: string) => {
    return service.post(`loginWithEmail`, { email });
};
// 提交邮箱验证码登录表单
export const submitEmailLoginForm = (formData: EmailLogin) => {
    return service.post('loginWithEmail', formData);
};

// 生成注册的验证码请求
export const generateRegisterCode = (email: string) => {
    return service.post(`register`, { email });
};
// 提交注册表单
export const registerUser = (formData: RegisterUser) => {
    return service.post('register', formData);
};


//获取用户信息
export const getUserInfo = () => {
    return service.get("authrequired/user/getUserInfo")
}

//用户列表
export const getUserList = (params:object) => {
    return service.get("authrequired/admin/getAllUsersWithQuery", {params})
}
// 批量删除用户
export const batchDeleteUser = (id_list:number[]) => {
    return service.delete("authrequired/admin/batchDeleteUser",{
        data: {
            id_list,
        }
    })
}
// 管理员新增用户
export const adminRegisterUser = (formData:RegisterUser) => {
    return service.post('authrequired/admin/registerUser', formData);
};
// 管理员修改用户
export const modifyUserInfo = (formData:ModifyUser) => {
    return service.patch('authrequired/admin/modifyUser', formData);
}