export interface MenuItem {
  index: string;
  title: string;
  icon: string;
  name: string;
  scope:string[];
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
  new_password: string
  confirm_password: string
}
export interface EmailLogin {
  email: string
  verificationCode: string
}
export interface PasswordLogin{
  username: string
  email: string
  password: string
}
export interface RegisterUser {
  name: string
  email: string
  verificationCode: string
  password: string
  confirm_password: string
  nick_name: string,
  sex: string,
  role:string,
}
export interface UserInfo {
  email: string
  id: number
  ip: string
  name: string
  role: string
  sex: string
  avatar: string
  nick_name: string
}
// 用于用户管理获取用户的信息
export interface User {
  id: number;
  name: string;
  email: string;
  nick_name: string;
  sex: string;
  avatar: string;
  ip: string;
  role: string;
  created_at: string;
}
// 用户管理搜索表单
export interface SearchForm {
  name: string;
  email: string;
  role:string;
}
export interface PaginationForm {
  page:number;
  limit:number;
}
export interface ModifyUser{
  id: number;
  name: string;
  email: string;
  nick_name: string;
  sex: string;
  avatar: string;
}