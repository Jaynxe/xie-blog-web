<script setup lang="ts">
import {
  dayjs,
  ElMessage,
  type ElTable,
  type FormInstance,
  type FormRules,
  type UploadRequestOptions, type UploadUserFile
} from "element-plus";
import {Delete, DeleteFilled, EditPen, Plus, Refresh, Search} from "@element-plus/icons-vue";
import {adminRegisterUser, batchDeleteUser, getUserList, modifyUserInfo, imageUpload} from "@/api";
import {errorCode} from "@/utils/errcode";
import type {ModifyUser, PaginationForm, RegisterUser, SearchForm, User} from "@/types";
import {computed, onMounted, reactive, ref} from "vue";
import {ElConfigProvider} from 'element-plus';
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn';


// 显示消息提示
const showMessage = (message: string, type: 'success' | 'warning' | 'info' | 'error') => {
  ElMessage({
    message,
    type,
    duration: 3000,
  });
};
// 处理错误逻辑
const handleError = (error: any) => {
  if (error.response && error.response.data && error.response.data.status) {
    if (error.response.data.status === 1) {
      showMessage(error.response.data.reason, "error");
    } else {
      showMessage(errorCode[error.response.data.status] || "未知错误", "error");
    }
  } else {
    showMessage("请求失败，请稍后再试.", "error");
  }
};

const addUserFormRef = ref<FormInstance>(); // 添加用户表单实例
const searchFormRef = ref<FormInstance>(); // 搜索表单实例
const modifyFormRef = ref<FormInstance>(); // 修改用户表单实例

// 添加用户的表单数据
const registerForm = reactive<RegisterUser>({
  name: "",
  email: "",
  verificationCode: "",
  password: "",
  confirm_password: "",
  nick_name: "",
  sex: "",
  role: "",
});
/* 修改用户的表单数据 */
const modifyForm = reactive<ModifyUser>({
  id: 0,
  avatar: "",
  email: "",
  name: "",
  nick_name: "",
  sex: ""
});
//用户列表的数据
const tableData = ref<User[]>();
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
// 表单提交验证和处理逻辑
const submitSearchForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return; // 如果 formEl 不存在，直接返回，不执行后续逻辑
  // 检查搜索参数是否为空
  const isEmpty = !searchParams.name.trim() && !searchParams.email.trim() && !searchParams.role.trim();
  if (isEmpty) {
    showMessage("搜索条件不能为空", "warning");
    return;
  }
  formEl.validate(valid => {
    if (valid) {  // 如果表单验证通过
      searchUser();
    } else {
      showMessage("请检查表单输入", "warning");
    }
  });
};
const submitUserForm = (formEl: FormInstance | undefined, collBack: Function) => {
  if (!formEl) return; // 如果 formEl 不存在，直接返回，不执行后续逻辑
  formEl.validate(valid => {
    if (valid) {  // 如果表单验证通过
      addUserDialogVisible.value = false;
      collBack();
    } else {
      showMessage("请检查表单输入", "warning");
      addUserDialogVisible.value = false;
    }
  });
};

/* 添加用户 */
const toAddUser = async () => {
  try {
    const response = await adminRegisterUser(registerForm);

    if (response.data.status === 0) {
      showMessage("添加用户成功", "success");
      await toUserList(); // 成功后刷新用户列表
      resetForm(addUserFormRef.value); // 清空表单
    }
  } catch (error) {
    handleError(error);
  }
};
/* 批量删除用户 */
const toBatchDelete = async () => {
  const idList = multipleSelection.value.map(item => item.id);
  try {
    const response = await batchDeleteUser(idList);

    if (response.data.status === 0) {
      showMessage("批量删除用户成功", "success");
      await toUserList(); // 删除成功后刷新用户列表
    }
  } catch (error) {
    handleError(error);
  }
};
/* 删除单个用户 */
const toDeleteUser = async (row: any) => {
  const userId = Array.of(row.id as number)
  try {
    const response = await batchDeleteUser(userId);

    if (response.data.status === 0) {
      showMessage("删除用户成功", "success");
      await toUserList(); // 删除成功后刷新用户列表
      resetForm(addUserFormRef.value); // 清空表单
    }
  } catch (error) {
    handleError(error);
  }
}

/* 修改用户信息 */
const toModifyUser = async () => {
  try {
    const response = await modifyUserInfo(modifyForm);

    if (response.data.status === 0) {
      showMessage("修改信息成功", "success");
      await toUserList(); // 删除成功后刷新用户列表
    }
  } catch (error) {
    handleError(error);
  }
}
// 格式化时间
const formatDate = (row: any, column: any, cellValue: any) => {
  return dayjs(new Date(cellValue)).format("YYYY-MM-DD");
};
// 注册表单的验证规则
const registerRules = reactive<FormRules<typeof registerForm>>({
  name: [{required: true, message: "请输入姓名", trigger: "blur"}],
  nick_name: [{required: true, message: "请输入昵称", trigger: "blur"}],
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {type: "email", message: "请输入有效的邮箱地址", trigger: "blur"},
  ],
  role: [{required: true, message: "请输入选择角色", trigger: "blur"}],
  password: [{required: true, message: "请输入新密码", trigger: "blur"}],
  confirm_password: [
    {required: true, message: "请确认新密码", trigger: "blur"},
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});
// 搜索表单验证规则
const searchRules = reactive<FormRules<typeof searchParams>>({
  name: [{message: "请输入姓名", trigger: "blur"}],
  email: [
    {message: "请输入邮箱", trigger: "blur"},
    {type: "email", message: "请输入有效的邮箱地址", trigger: "blur"},
  ],
})
// 表单按钮是否接触禁用
const canSubmit = computed(() => {
  const {name, nick_name, role, password, confirm_password} = registerForm;
  return Boolean(name && role && nick_name && password && confirm_password);
});
const addUserDialogVisible = ref(false); //控制对话框
const ModifyUserDialogVisible = ref(false); //控制对话框
// 关闭对话框时清除表单
const handleBeforeClose = (formRef: FormInstance | undefined) => {
  return (done: () => void) => {
    resetForm(formRef); // 调用传入的重置函数
    done(); // 完成对话框关闭操作
  };
};

/* 表格多选功能 */
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const multipleSelection = ref<User[]>([]); // 响应式存储当前选中的用户列表
// 选中行变化后更新当前选中的用户列表
const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val;
};

/* 分页的属性和方法 */
const defaultPage = 1;
const defaultSize = 5; // 假设每页大小为4
const currentPage = ref(defaultPage); // 默认当前页
const pageSize = ref(defaultSize); // 默认每页大小

const loading = ref(false); // 刷新加载效果
const isRotating = ref(false); // 刷新图标旋转
const isSearchState = ref(false); // 是否处于搜索状态
const total = ref(0); // 总数据条数

// 分页参数对象
const paginationParams = reactive<PaginationForm>({
  page: currentPage.value,
  limit: pageSize.value,
});

// 查询参数对象
const searchParams = reactive<SearchForm>({
  name: "",
  email: "",
  role: "",
});

// 更新分页参数
const updatePaginationParams = () => {
  paginationParams.page = currentPage.value;
  paginationParams.limit = pageSize.value;
};

// 修剪搜索参数
const trimSearchParams = () => {
  searchParams.name = searchParams.name.trim();
  searchParams.email = searchParams.email.trim();
};

// 获取用户列表
const toUserList = async () => {
  loading.value = true;
  isRotating.value = true;
  try {
    const params = isSearchState.value ? {...paginationParams, ...searchParams} : {...paginationParams};
    const response = await getUserList(params);
    if (response.data.status === 0) {
      tableData.value = response.data.data.data;
      total.value = parseInt(response.data.data.total, 10); // 设置总数据条数
    }
  } catch (error) {
    handleError(error);
  } finally {
    setTimeout(() => {
      loading.value = false;
      isRotating.value = false;
    }, 500);
  }
};

// 刷新用户列表
const refreshUserList = async () => {
  try {
    resetPagination();
    updatePaginationParams();
    await toUserList();
    ElMessage.success("刷新成功");
  } catch (e) {
    ElMessage.error("刷新失败");
  }
};

// 重置分页参数
const resetPagination = () => {
  currentPage.value = defaultPage;
  pageSize.value = defaultSize;
};

// 页大小改变处理
const handleSizeChange = async (val: number) => {
  pageSize.value = val;
  currentPage.value = defaultPage; // 切换页大小时，重置当前页为1
  updatePaginationParams();
  await toUserList();
};

// 当前页改变处理
const handleCurrentChange = async (val: number) => {
  currentPage.value = val;
  updatePaginationParams();
  await toUserList();
};

// 搜索用户方法
const searchUser = async () => {
  isSearchState.value = true;  // 设置为搜索状态
  trimSearchParams(); // 修剪搜索参数
  resetPagination(); // 搜索时重置分页参数
  updatePaginationParams();
  await toUserList();
};

// 重置并刷新用户列表
const handleResetAndRefresh = () => {
  const isEmpty = !searchParams.name.trim() && !searchParams.email.trim() && !searchParams.role.trim();
  if (isEmpty) {
    return;
  }
  isSearchState.value = false; // 取消搜索状态
  resetForm(searchFormRef.value);
  searchParams.name = "";
  searchParams.email = "";
  searchParams.role = "";
  refreshUserList();
};


/* 图片上传 */
const uploadRef = ref();
// 文件列表
const fileList = ref<UploadUserFile[]>([
  {
    name: '',
    url: '',
  },
]);
/* 点击编辑按钮给弹出框赋值 */
const toModify = (row: any) => {
  Object.assign(modifyForm, row);
  if (fileList.value.length === 0) {
    fileList.value.push({name: '', url: row.avatar});
  } else {
    fileList.value[0].url = row.avatar
  }
}
const customHttpRequest = async (options: UploadRequestOptions) => {
  const formData = new FormData();
  formData.append('file', options.file);
  try {
    const response = await imageUpload(formData)
    modifyForm.avatar = response.data.data[0].file_path
    fileList.value[0].url = modifyForm.avatar
    showMessage("上传成功", "success")
  } catch (error: any) {
    showMessage(error.response.data.data[0].upload_status, "error")
  }
};
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isJpgOrPng) {
    ElMessage.error('上传文件格式必须为 jpg 或 png!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('上传文件大小不能超过 5MB!');
    return false;
  }
  return true;
};
const submitUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.submit();
  }
};
onMounted(() => {
  toUserList();
});

</script>


<template>
  <div class="user-container h-full flex flex-col gap-2.5">
    <div class="user-search">
      <el-card shadow="hover">
        <template #header>
          <span class="header-title">搜索</span>
        </template>
        <el-form :inline="true" :model="searchParams" ref="searchFormRef" :rules="searchRules">
          <el-form-item label="用户名:" prop="name">
            <el-input v-model="searchParams.name" placeholder="请输入用户名"/>
          </el-form-item>
          <el-form-item label="邮箱:" prop="email">
            <el-input v-model="searchParams.email" placeholder="请输入邮箱"/>
          </el-form-item>
          <el-form-item label="角色:" prop="role">
            <el-select v-model="searchParams.role" placeholder="请选择用户角色" style="width: 160px;">
              <el-option label="admin" value="admin"/>
              <el-option label="user" value="user"/>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitSearchForm(searchFormRef)" :icon="Search" plain>搜索</el-button>
            <el-button @click="handleResetAndRefresh  " :icon="Refresh" plain>重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="user-main w-full">
      <el-card shadow="hover">
        <div class="main-header flex justify-between items-center mb-5">
          <span class="header-title">用户列表</span>
          <div class="user-actions">
            <el-button @click="addUserDialogVisible = true" type="primary" plain>
              <el-icon>
                <Plus/>
              </el-icon>&nbsp;新增用户
            </el-button>
            <el-popconfirm @confirm="toBatchDelete" title="您确定要删除这些用户吗?">
              <template #reference>
                <el-button type="danger" plain :disabled="multipleSelection.length === 0">
                  <el-icon>
                    <DeleteFilled/>
                  </el-icon>&nbsp;批量删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-button text bg @click="refreshUserList">
              <el-icon :class="{'animate-spin': isRotating}">
                <Refresh/>
              </el-icon>&nbsp;刷新
            </el-button>
          </div>
        </div>

        <el-dialog v-model="addUserDialogVisible" title="新增用户" style="border-radius: 10px" width="700px"
                   :before-close="handleBeforeClose(addUserFormRef)">
          <el-form :model="registerForm" label-position="left" require-asterisk-position="right" label-width="85px"
                   :rules="registerRules" ref="addUserFormRef" status-icon>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="用户名:" prop="name">
                  <el-input v-model="registerForm.name" placeholder="请输入用户名" clearable/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称:" prop="nick_name">
                  <el-input v-model="registerForm.nick_name" placeholder="请输入昵称" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="密码:" prop="password">
                  <el-input type="password" v-model="registerForm.password" placeholder="包含大小写长度不小于八位"
                            show-password clearable/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码:" prop="confirm_password">
                  <el-input type="password" v-model="registerForm.confirm_password" placeholder="请确认密码"
                            show-password clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="邮箱:" prop="email">
                  <el-input v-model="registerForm.email" placeholder="请输入邮箱" clearable/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别:" prop="sex">
                  <el-select v-model="registerForm.sex" placeholder="请选择性别">
                    <el-option label="男" value="男"/>
                    <el-option label="女" value="女"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="角色:" prop="role">
                  <el-select v-model="registerForm.role" placeholder="请选择用户角色">
                    <el-option label="admin" value="admin"/>
                    <el-option label="user" value="user"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="resetForm(addUserFormRef); addUserDialogVisible = false">取消</el-button>
              <el-button type="primary" :disabled="!canSubmit" @click="submitUserForm(addUserFormRef,toAddUser);">确定
              </el-button>
            </div>
          </template>
        </el-dialog>

        <el-dialog v-model="ModifyUserDialogVisible" title="修改用户信息" style="border-radius: 10px" width="700px">
          <el-form :model="modifyForm" label-position="left" require-asterisk-position="right" label-width="85px"
                   ref="modifyFormRef" status-icon>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="用户名:" prop="name">
                  <el-input v-model="modifyForm.name" placeholder="请输入用户名" clearable/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称:" prop="nick_name">
                  <el-input v-model="modifyForm.nick_name" placeholder="请输入昵称" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="邮箱:" prop="email">
                  <el-input v-model="modifyForm.email" placeholder="请输入邮箱" clearable/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别:" prop="sex">
                  <el-select v-model="modifyForm.sex" placeholder="请选择性别">
                    <el-option label="男" value="男"/>
                    <el-option label="女" value="女"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="头像上传:">
                  <el-upload
                      ref="uploadRef"
                      v-model:file-list="fileList"
                      :http-request="customHttpRequest"
                      :before-upload="beforeUpload"
                      list-type="picture"
                      :auto-upload="false"
                      :limit="1"
                  >
                    <template #trigger>
                      <el-button type="primary">选择文件</el-button>
                    </template>

                    <el-button class="ml-3" type="success" @click="submitUpload">
                      上传文件
                    </el-button>

                    <template #tip>
                      <div class="el-upload__tip">
                        jpg/png files with a size less than 5M
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click=" ModifyUserDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="toModifyUser();ModifyUserDialogVisible = false">确定</el-button>
            </div>
          </template>
        </el-dialog>


        <div class="user-tables" v-loading="loading">
          <el-table
              class="border border-solid border-gray-200 rounded "
              :data="tableData"
              style="width: 100%; height: calc(100vh - 475px);"
              ref="multipleTableRef"
              @selection-change="handleSelectionChange"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 'text-align': 'center', 'background-color': '#f5f5f5' }"
          >
            <el-table-column type="selection" width="55"/>
            <el-table-column fixed prop="id" label="用户编号" width="160"/>
            <el-table-column prop="name" label="用户名" width="120"/>
            <el-table-column prop="sex" label="性别" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.sex === '男' ? 'primary' : 'danger'">{{ scope.row.sex }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="avatar" label="头像" width="120">
              <template #default="scope">
                <el-image
                    :preview-teleported="true"
                    style="height: 40px; width: 40px"
                    :src="scope.row.avatar"
                    :preview-src-list="[scope.row.avatar]"
                    fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="nick_name" label="昵称" width="120"/>
            <el-table-column prop="role" label="角色" width="120"/>
            <el-table-column prop="ip" label="IP" width="120"/>
            <el-table-column prop="email" label="邮箱" width="250"/>
            <el-table-column prop="created_at" label="注册时间" :formatter="formatDate" width="120"/>
            <el-table-column prop="operations" fixed="right" label="操作" width="120">
              <template #default="scope">
                <el-button link @click="ModifyUserDialogVisible = true; toModify(scope.row)" type="primary"
                           size="small">
                  <el-icon>
                    <EditPen/>
                  </el-icon>
                  编辑
                </el-button>
                <el-popconfirm @confirm="toDeleteUser(scope.row)" title="您确定要删除该用户吗?">
                  <template #reference>
                    <el-button link type="danger" size="small">
                      <el-icon>
                        <Delete/>
                      </el-icon>
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="user-pages flex justify-end h-8 mt-5">
          <el-config-provider :locale="zhCn">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 15, 20]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @update:page-size="handleSizeChange"
                @update:current-page="handleCurrentChange"
            />
          </el-config-provider>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
