<!-- 用户管理页面组件 -->
<!-- html区域 -->
<template>
  <div class="user-container">
    <el-card class="user-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">用户管理</span>
          <span class="header-subtitle">共 {{ config.total }} 条记录</span>
        </div>
      </template>
      
      <!-- 顶部的新增和搜索框 -->
      <div class="user-header">
        <!-- 用户新增功能 -->
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增用户</el-button>
        <el-form :inline="true" :model="formInline" class="search-form">
          <el-form-item>
            <el-input 
              v-model="formInline.keyword" 
              placeholder="请输入用户名" 
              clearable
              :prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <!-- 搜索功能 -->
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 用户页面表格部分 -->
      <div class="table-container">
        <el-table 
          :data="tableData" 
          style="width: 100%"
          border
          stripe
          highlight-current-row
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          v-loading="loading"
        >
          <!-- 做一个循环 循环出所有的表格列数 包括有姓名 地址 年龄 -->
          <el-table-column 
            v-for="item in tableLabel"
            :key="item.prop"
            :width="item.width ? item.width : 125"
            :prop="item.prop"
            :label="item.label"
          />
          
          <!-- 编辑和删除部分 -->
          <el-table-column fixed="right" label="操作" min-width="150" align="center">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
                :icon="Edit"
                text
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDelete(scope.row)"
                :icon="Delete"
                text
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页功能 -->
        <div class="pagination-container">
          <el-pagination 
            background 
            layout="total, sizes, prev, pager, next, jumper" 
            :total="config.total" 
            :page-sizes="[10, 20, 30, 50]"
            v-model:current-page="config.page"
            v-model:page-size="config.pageSize"
            @current-change="handleChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>
    
    <!-- 用户新增/编辑界面 -->
    <el-dialog
      v-model="dialogVisible"
      :title="action == 'add' ? '新增用户' : '编辑用户'"
      width="40%"
      :before-close="handleClose"
      destroy-on-close
    >
      <el-form 
        :model="formUser" 
        :rules="rules" 
        ref="userForm" 
        label-width="80px"
        label-position="right"
        class="user-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formUser.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input v-model.number="formUser.age" placeholder="请输入年龄" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="formUser.sex" placeholder="请选择" style="width: 100%">
                <el-option label="男" value="1" />
                <el-option label="女" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birth">
              <el-date-picker
                v-model="formUser.birth"
                type="date"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="地址" prop="addr">
          <el-input v-model="formUser.addr" placeholder="请输入地址" />
        </el-form-item>
        
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<!-- 用户界面渲染 js区域 -->
<script setup>
import { reactive, ref, getCurrentInstance, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { 
  Plus, 
  Edit, 
  Delete, 
  Search,
  User
} from '@element-plus/icons-vue';

// 表格数据部分
const tableData = ref([]);
const loading = ref(false);
const submitLoading = ref(false);

const { proxy } = getCurrentInstance();

const getUserData = async () => {
  loading.value = true;
  try {
    let data = await proxy.$api.getUserData(config);
    tableData.value = data.list.map((item) => ({
      ...item,
      sexLabel: item.sex === '1' ? '男' : '女'
    }));
    config.total = data.count;
  } catch (error) {
    ElMessage.error('获取用户数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const config = reactive({
  name: '',
  total: 0,
  page: 1,
  pageSize: 10
});

const handleChange = (page) => {
  config.page = page;
  getUserData();
};

const handleSizeChange = (size) => {
  config.pageSize = size;
  getUserData();
};

const handleSearch = () => {
  config.page = 1; // 搜索时重置到第一页
  config.name = formInline.keyword;
  getUserData();
};

//新增用户操作
const handleAdd = () => {
  dialogVisible.value = true;
  action.value = 'add';
  // 重置表单
  nextTick(() => {
    formUser.name = '';
    formUser.age = '';
    formUser.sex = '1';
    formUser.birth = '';
    formUser.addr = '';
    if (proxy.$refs.userForm) {
      proxy.$refs.userForm.resetFields();
    }
  });
};

//用户删除
const handleDelete = (val) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${val.name}" 吗？此操作不可恢复。`, 
    '删除确认', 
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true
    }
  ).then(async () => {
    try {
      await proxy.$api.deleteUser({ id: val.id });
      ElMessage({
        type: 'success',
        message: '删除成功'
      });
      getUserData();
    } catch (error) {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
};

//对话框右上角的关闭事件
const handleClose = () => {
  if (proxy.$refs.userForm) {
    proxy.$refs.userForm.resetFields();
  }
  dialogVisible.value = false;
};

//对话框右下角的取消操作
const handleCancel = () => {
  if (proxy.$refs.userForm) {
    proxy.$refs.userForm.resetFields();
  }
  dialogVisible.value = false;
};

//用户界面-编辑操作
const handleEdit = (val) => {
  action.value = "edit";
  dialogVisible.value = true;

  nextTick(() => {
    Object.assign(formUser, { ...val, sex: "" + val.sex });
    if (proxy.$refs.userForm) {
      proxy.$refs.userForm.clearValidate();
    }
  });
};

//格式化日期，格式化为：1997-01-02这种 新增界面的操作
const timeFormat = (time) => {
  var time = new Date(time);
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var date = time.getDate();
  function add(m) {
    return m < 10 ? "0" + m : m;
  }
  return year + "-" + add(month) + "-" + add(date);
};

// 这个 onSubmit 函数是一个表单提交的处理函数，主要用于新增或编辑用户信息
const onSubmit = () => {
  if (!proxy.$refs.userForm) return;
  
  proxy.$refs.userForm.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        let res = null;
        formUser.birth = /^\d{4}-\d{2}-\d{2}$/.test(formUser.birth) 
          ? formUser.birth 
          : timeFormat(formUser.birth);
          
        if (action.value === "add") {
          res = await proxy.$api.addUser(formUser);
          ElMessage.success('添加用户成功');
        } else {
          res = await proxy.$api.editUser(formUser);
          ElMessage.success('更新用户成功');
        }
        
        if (res) {
          dialogVisible.value = false;
          proxy.$refs.userForm.resetFields();
          getUserData();
        }
      } catch (error) {
        ElMessage.error(action.value === "add" ? '添加用户失败' : '更新用户失败');
        console.error(error);
      } finally {
        submitLoading.value = false;
      }
    } else {
      ElMessage({
        showClose: true,
        message: "请填写所有必填项",
        type: "error",
      });
    }
  });
};

const tableLabel = reactive([
  {
    prop: 'name',
    label: '姓名'
  },
  {
    prop: 'age',
    label: '年龄'
  },
  {
    prop: 'sexLabel',
    label: '性别'
  },
  {
    prop: 'birth',
    label: '出生日期',
    width: 200
  },
  {
    prop: 'addr',
    label: '地址',
    width: 300
  },
]);

onMounted(() => {
  getUserData();
});

const formInline = reactive({
  keyword: "",
});

//控制对话框是否显示
const dialogVisible = ref(false);

//新增和编辑共用一个窗口，所以通过设置action区分
const action = ref("add");

const formUser = reactive({
  sex: '1'
});

//表单校验规则
const rules = reactive({
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  age: [
    { required: true, message: "请输入年龄", trigger: "blur" },
    { type: "number", message: "年龄必须是数字" },
  ],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  birth: [{ required: true, message: "请选择出生日期", trigger: "change" }],
  addr: [{ required: true, message: '请输入地址', trigger: "blur" }]
});
</script>
    
<!-- css区域 -->
<style lang="less" scoped>
.user-container {
  padding: 20px;
  
  .user-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .card-header {
      display: flex;
      align-items: center;
      
      .header-title {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
      
      .header-subtitle {
        margin-left: 10px;
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      align-items: center;
    }
  }
  
  .table-container {
    position: relative;
    
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
  
  .user-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
  }
}

// 添加一些动画效果
.el-table {
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
}

.el-button {
  transition: all 0.3s ease;
}

.el-dialog {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-dialog__header) {
    background-color: #f5f7fa;
    padding: 15px 20px;
    margin-right: 0;
    border-bottom: 1px solid #e4e7ed;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
</style>