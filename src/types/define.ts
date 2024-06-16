export interface MenuItem {
  index: string;
  title: string;
  icon: string;
  name: string;
  children?: MenuItem[];
}

export interface WeatherData {
  city: string;
  reporttime: string;
  temperature: string;
  weather: string;
}
// 定义错误码对象的类型
export type ErrorCodeType = {
  [key: number]: string;
};

/* 重置密码的表单类型 */
export interface ResetPassword {
  email: string
  verificationCode: string
  newPassword: string
  confirmPassword: string
}
export interface EmailLogin {
  email: string
  verificationCode: string
}

export interface RegisterDate {
  name: string
  email: string
  verificationCode: string
  password: string
  confirmPassword: string
  nickName: string,
  sex: string,
}
export interface UserInfo {
  email: string
  id: number
  ip: string
  name: string
  role: string
  sex: string
  avatar: string
  nickName: string
}

export interface WeatherMap{
}