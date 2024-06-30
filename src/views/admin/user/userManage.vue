<script setup lang="ts">
import { dayjs, ElMessage, type ElTable, type FormInstance, type FormRules } from "element-plus";
import { Delete, DeleteFilled, EditPen, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { adminRegisterUser, batchDeleteUser, getUserList } from "@/api"; // Assume deleteUser is an API function to delete a single user
import { errorCode } from "@/utils/errcode";
import type { RegisterData, User,SearchForm} from "@/types/define";
import { computed, ref, reactive, onMounted } from "vue";


const userFormRef = ref<FormInstance>(); // 添加用户表单实例
const ruleFormRef = ref<FormInstance>(); // 搜索表单实例
// 搜索的表单数据
const searchForm = reactive<SearchForm>({
  username: "",
  phone: "",
});
// 添加用户的表单数据
const registerForm = reactive<RegisterData>({
  name: "",
  email: "",
  verificationCode: "",
  password: "",
  confirm_password: "",
  nick_name: "",
  sex: "",
  role: "",
});
const tableData = ref<User[]>(); //用户列表的数据
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
// 表单提交验证和处理逻辑
const submitSearchForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return; // 如果 formEl 不存在，直接返回，不执行后续逻辑
  formEl.validate(valid => {
    if (valid) {  // 如果表单验证通过
      console.log("进行搜索")
      // 搜索的逻辑...
    }
  });
};
const submitUserForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return; // 如果 formEl 不存在，直接返回，不执行后续逻辑
  formEl.validate(valid => {
    if (valid) {  // 如果表单验证通过
      dialogFormVisible.value = false;
      addUser();
    }
  });
};
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
    if (error.response.data.status === 1){
      showMessage(error.response.data.reason, "error");
    }else{
      showMessage(errorCode[error.response.data.status] || "未知错误", "error");
    }
  } else {
    showMessage("请求失败，请稍后再试.", "error");
  }
};

/* 用户列表部分 */
const toUserList = async () => {
  try {
    const response = await getUserList();
    if (response.data.status === 0) {
      tableData.value = response.data.data;
    }
  } catch (error) {
    handleError(error);
  }
};
const addUser = async () => {
  try {
    const response = await adminRegisterUser(registerForm);

    if (response.data.status === 0) {
      showMessage("添加用户成功", "success");
      await toUserList(); // 成功后刷新用户列表
      resetForm(userFormRef.value); // 清空表单
    }
  } catch (error) {
    handleError(error);
  }
};
const batchDelete = async () => {
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

const deleteUser = async (row: any) => {
  const idList = Array.of(row.id as number)
  try {
    const response = await batchDeleteUser(idList);

    if (response.data.status === 0) {
      showMessage("删除用户成功", "success");
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
// 表单的验证规则
const rules = reactive<FormRules<typeof registerForm>>({
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  nick_name: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  role: [{ required: true, message: "请输入选择角色", trigger: "blur" }],
  password: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirm_password: [
    { required: true, message: "请确认新密码", trigger: "blur" },
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
// 表单按钮是否接触禁用 
const canSubmit = computed(() => {
  const { name, nick_name, role, password, confirm_password } = registerForm;
  return Boolean(name && role && nick_name && password && confirm_password);
});
const dialogFormVisible = ref(false); //控制对话框
// 关闭对话框时清除表单
const handleBeforeClose = (done: () => void) => {
  resetForm(userFormRef.value); // 在对话框关闭前清空表单
  done();
};

// 表格多选功能
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const multipleSelection = ref<User[]>([]); // 响应式存储当前选中的用户列表
// 选中行变化后更新当前选中的用户列表
const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val;
};

/* 分页的属性和方法 */
const currentPage = ref(1);
const pageSize = ref(20);
const small = ref(false);
const disabled = ref(false);
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
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
        <el-form :inline="true" :model="searchForm" ref="ruleFormRef">
          <el-form-item label="用户名:" prop="username">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="手机号:" prop="phone">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitSearchForm(ruleFormRef)" :icon="Search" plain>搜索</el-button>
            <el-button @click="resetForm(ruleFormRef)" :icon="Refresh" plain>重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="user-main w-full">
      <el-card shadow="hover">
        <div class="main-header flex justify-between items-center mb-5">
          <span class="header-title">用户列表</span>
          <div class="user-actions">
            <el-button @click="dialogFormVisible = true" type="primary" plain>
              <el-icon><Plus /></el-icon>&nbsp;新增用户
            </el-button>
            <el-popconfirm @confirm="batchDelete" title="您确定要删除这些用户吗?">
              <template #reference>
                <el-button type="danger" plain :disabled="multipleSelection.length === 0">
                  <el-icon><DeleteFilled /></el-icon>&nbsp;批量删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <el-dialog v-model="dialogFormVisible" title="新增用户" style="border-radius: 10px"  width="700px" :before-close="handleBeforeClose">
          <el-form :model="registerForm" label-position="left" require-asterisk-position="right" label-width="85px" :rules="rules" ref="userFormRef" status-icon>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="用户名:" prop="name">
                  <el-input v-model="registerForm.name" placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称:" prop="nick_name">
                  <el-input v-model="registerForm.nick_name" placeholder="请输入昵称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="密码:" prop="password">
                  <el-input type="password" v-model="registerForm.password" placeholder="包含大小写长度不小于八位" show-password />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码:" prop="confirm_password">
                  <el-input type="password" v-model="registerForm.confirm_password" placeholder="请确认密码" show-password />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="邮箱:" prop="email">
                  <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别:">
                  <el-select v-model="registerForm.sex" placeholder="请选择性别">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="角色:" prop="role">
                  <el-select v-model="registerForm.role" placeholder="请选择用户角色">
                    <el-option label="admin" value="admin" />
                    <el-option label="user" value="user" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="resetForm(userFormRef); dialogFormVisible = false">取消</el-button>
              <el-button type="primary" :disabled="!canSubmit" @click="submitUserForm(userFormRef);">确定</el-button>
            </div>
          </template>
        </el-dialog>

        <div class="user-tables">
          <el-table
              class="border border-solid border-gray-200 rounded "
              :data="tableData"
              style="width: 100%; height: calc(100vh - 460px);"
              ref="multipleTableRef"
              @selection-change="handleSelectionChange"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 'text-align': 'center', 'background-color': '#f5f5f5' }"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column fixed prop="id" label="用户编号" width="160" />
            <el-table-column prop="name" label="用户名" width="120" />
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
            <el-table-column prop="nick_name" label="昵称" width="120" />
            <el-table-column prop="role" label="角色" width="120" />
            <el-table-column prop="ip" label="IP" width="120" />
            <el-table-column prop="email" label="邮箱" width="250" />
            <el-table-column prop="created_at" label="注册时间" :formatter="formatDate" width="120" />
            <el-table-column prop="operations" fixed="right" label="操作" width="120">
              <template #default="scope">
                <el-button link type="primary" size="small">
                  <el-icon><EditPen /></el-icon>编辑
                </el-button>
                <el-popconfirm @confirm="deleteUser(scope.row)" title="您确定要删除该用户吗?">
                  <template #reference>
                    <el-button link type="danger" size="small">
                      <el-icon><Delete /></el-icon>删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="user-pages flex justify-end h-8 mt-5">
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 40]"
              :small="small"
              :disabled="disabled"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="20"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
