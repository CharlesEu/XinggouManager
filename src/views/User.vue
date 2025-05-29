<!-- 用户管理页面组件 - 实现用户数据的增删改查功能 -->
<!-- html区域 - 使用Element Plus组件库构建用户界面 -->
<template>
  <!-- 用户管理页面的最外层容器，提供统一的内边距 -->
  <div class="user-container">
    <!-- 使用el-card组件包裹整个用户管理内容，提供卡片式UI -->
    <el-card class="user-card">
      <!-- 卡片头部区域，显示标题和记录总数 -->
      <template #header>
        <div class="card-header">
          <span class="header-title">用户管理</span>
          <span class="header-subtitle">共 {{ config.total }} 条记录</span>
        </div>
      </template>
      
      <!-- 顶部操作区：包含新增按钮和搜索框 -->
      <div class="user-header">
        <!-- 新增用户按钮：点击触发handleAdd方法，使用Plus图标 -->
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增用户</el-button>
        <!-- 搜索表单：使用inline模式实现水平布局 -->
        <el-form :inline="true" :model="formInline" class="search-form">
          <el-form-item>
            <!-- 搜索输入框：支持清空和回车搜索功能 -->
            <el-input 
              v-model="formInline.keyword" 
              placeholder="请输入用户名" 
              clearable
              :prefix-icon="Search"
              @keyup.enter="debouncedHandleSearch"
            />
          </el-form-item>
          <!-- 搜索按钮：点击触发handleSearch方法 -->
          <el-form-item>
            <el-button type="primary" @click="debouncedHandleSearch" :icon="Search">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 用户数据表格区域：展示用户列表数据 -->
      <div class="table-container">
        <!-- 使用el-table组件展示用户数据，支持边框、斑马纹、行高亮等特性 -->
        <el-table 
          :data="tableData" 
          style="width: 100%"
          border
          stripe
          highlight-current-row
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          v-loading="loading"
        >
          <!-- 动态生成表格列：根据tableLabel数组自动渲染不同的列 -->
          <el-table-column 
            v-for="item in tableLabel"
            :key="item.prop"
            :width="item.width ? item.width : 125"
            :prop="item.prop"
            :label="item.label"
          />
          
          <!-- 操作列：固定在右侧，包含编辑和删除按钮 -->
          <el-table-column fixed="right" label="操作" min-width="150" align="center">
            <template #default="scope">
              <!-- 编辑按钮：点击触发handleEdit方法，传入当前行数据 -->
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
                :icon="Edit"
                text
              >
                编辑
              </el-button>
              <!-- 删除按钮：点击触发handleDelete方法，传入当前行数据 -->
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
        
        <!-- 分页控件：支持页码切换、每页条数调整、跳转等功能 -->
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
    
    <!-- 用户新增/编辑弹窗：根据action值动态显示标题 -->
    <el-dialog
      v-model="dialogVisible"
      :title="action == 'add' ? '新增用户' : '编辑用户'"
      width="40%"
      :before-close="handleClose"
      destroy-on-close
    >
      <!-- 用户表单：包含验证规则，使用ref引用DOM实例 -->
      <el-form 
        :model="formUser" 
        :rules="rules" 
        ref="userForm" 
        label-width="80px"
        label-position="right"
        class="user-form"
      >
        <!-- 第一行表单：姓名和年龄字段，使用栅格布局 -->
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
        
        <!-- 第二行表单：性别和出生日期字段 -->
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
        
        <!-- 地址字段：占据整行 -->
        <el-form-item label="地址" prop="addr">
          <el-input v-model="formUser.addr" placeholder="请输入地址" />
        </el-form-item>
        
        <!-- 表单底部按钮区域：取消和确定按钮 -->
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<!-- 用户界面渲染 js区域 - 使用Vue 3 Composition API实现业务逻辑 -->
<script setup>
// 导入Vue 3核心API
import { reactive, ref, getCurrentInstance, onMounted, nextTick } from "vue";
// 导入Element Plus消息组件
import { ElMessage, ElMessageBox } from "element-plus";
// 导入Element Plus图标
import { 
  Plus, // 新增图标
  Edit, // 编辑图标
  Delete, // 删除图标
  Search, // 搜索图标
  User // 用户图标
} from '@element-plus/icons-vue';
import debounce from "lodash/debounce";

/**
 * 表格数据相关的响应式变量
 */
// 用户表格数据数组
const tableData = ref([]);
// 加载状态标志
const loading = ref(false);
// 表单提交加载状态
const submitLoading = ref(false);

// 获取当前组件实例，用于访问全局属性和方法
const { proxy } = getCurrentInstance();

/**
 * 获取用户数据的方法
 * 从API获取用户列表数据并处理性别显示
 */
const getUserData = async () => {
  loading.value = true;
  try {
    // 调用API获取用户数据
    let data = await proxy.$api.getUserData(config);
    // 处理数据，添加性别标签
    tableData.value = data.list.map((item) => ({
      ...item,
      sexLabel: item.sex === '1' ? '男' : '女'
    }));
    // 更新总记录数
    config.total = data.count;
  } catch (error) {
    // 错误处理
    ElMessage.error('获取用户数据失败');
    console.error(error);
  } finally {
    // 无论成功失败都关闭加载状态
    loading.value = false;
  }
};

/**
 * 分页和查询配置对象
 */
const config = reactive({
  name: '', // 查询的用户名
  total: 0, // 总记录数
  page: 1, // 当前页码
  pageSize: 10 // 每页显示条数
});

/**
 * 页码变化处理函数
 * @param {number} page - 新的页码
 */
const handleChange = (page) => {
  config.page = page;
  getUserData();
};

/**
 * 每页条数变化处理函数
 * @param {number} size - 新的每页条数
 */
const handleSizeChange = (size) => {
  config.pageSize = size;
  getUserData();
};

/**
 * 搜索处理函数
 * 将搜索关键词赋值给config.name并重新获取数据
 */
// 将 handleSearch 用防抖函数包裹
const debouncedHandleSearch = debounce(() => {
  config.page = 1;
  config.name = formInline.keyword;
  getUserData();
}, 500); // 500ms 可根据需要调整

/**
 * 新增用户操作
 * 打开对话框并重置表单
 */
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

/**
 * 用户删除操作
 * @param {Object} val - 要删除的用户对象
 */
const handleDelete = (val) => {
  // 使用确认对话框防止误操作
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
      // 调用删除API
      await proxy.$api.deleteUser({ id: val.id });
      // 删除成功提示
      ElMessage({
        type: 'success',
        message: '删除成功'
      });
      // 重新获取数据
      getUserData();
    } catch (error) {
      // 删除失败处理
      ElMessage.error('删除失败');
      console.error(error);
    }
  }).catch(() => {
    // 用户取消删除操作
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
};

/**
 * 对话框右上角的关闭事件处理
 */
const handleClose = () => {
  if (proxy.$refs.userForm) {
    proxy.$refs.userForm.resetFields();
  }
  dialogVisible.value = false;
};

/**
 * 对话框右下角的取消操作
 */
const handleCancel = () => {
  if (proxy.$refs.userForm) {
    proxy.$refs.userForm.resetFields();
  }
  dialogVisible.value = false;
};

/**
 * 用户编辑操作
 * @param {Object} val - 要编辑的用户对象
 */
const handleEdit = (val) => {
  action.value = "edit";
  dialogVisible.value = true;

  nextTick(() => {
    // 将用户数据填充到表单，注意性别需要转为字符串
    Object.assign(formUser, { ...val, sex: "" + val.sex });
    if (proxy.$refs.userForm) {
      proxy.$refs.userForm.clearValidate();
    }
  });
};

/**
 * 日期格式化函数
 * @param {Date|string} time - 需要格式化的日期
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
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

/**
 * 表单提交处理函数
 * 根据action值决定是新增还是编辑操作
 */
const onSubmit = () => {
  if (!proxy.$refs.userForm) return;
  
  // 表单验证
  proxy.$refs.userForm.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        let res = null;
        // 处理日期格式
        formUser.birth = /^\d{4}-\d{2}-\d{2}$/.test(formUser.birth) 
          ? formUser.birth 
          : timeFormat(formUser.birth);
          
        // 根据action执行不同的API调用
        if (action.value === "add") {
          res = await proxy.$api.addUser(formUser);
          ElMessage.success('添加用户成功');
        } else {
          res = await proxy.$api.editUser(formUser);
          ElMessage.success('更新用户成功');
        }
        
        // 操作成功后关闭对话框并刷新数据
        if (res) {
          dialogVisible.value = false;
          proxy.$refs.userForm.resetFields();
          getUserData();
        }
      } catch (error) {
        // 错误处理
        ElMessage.error(action.value === "add" ? '添加用户失败' : '更新用户失败');
        console.error(error);
      } finally {
        submitLoading.value = false;
      }
    } else {
      // 表单验证失败提示
      ElMessage({
        showClose: true,
        message: "请填写所有必填项",
        type: "error",
      });
    }
  });
};

/**
 * 表格列配置数组
 * 定义表格的列名、属性名和宽度
 */
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

// 组件挂载时获取用户数据
onMounted(() => {
  getUserData();
});

/**
 * 搜索表单数据对象
 */
const formInline = reactive({
  keyword: "",
});

// 控制对话框是否显示
const dialogVisible = ref(false);

// 新增和编辑共用一个窗口，通过action区分操作类型
const action = ref("add");

/**
 * 用户表单数据对象
 * 默认性别设为男性(1)
 */
const formUser = reactive({
  sex: '1'
});

/**
 * 表单校验规则
 * 定义各字段的验证规则
 */
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
    
<!-- css区域 - 使用Less预处理器和scoped属性实现组件样式隔离 -->
<style lang="less" scoped>
/* 用户管理页面容器样式 */
.user-container {
  padding: 20px;
  
  /* 用户卡片样式 */
  .user-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    /* 卡片头部样式 */
    .card-header {
      display: flex;
      align-items: center;
      
      /* 标题样式 */
      .header-title {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
      
      /* 副标题样式 */
      .header-subtitle {
        margin-left: 10px;
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  /* 用户头部区域样式 */
  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    /* 搜索表单样式 */
    .search-form {
      display: flex;
      align-items: center;
    }
  }
  
  /* 表格容器样式 */
  .table-container {
    position: relative;
    
    /* 分页容器样式 */
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
  
  /* 用户表单样式 */
  .user-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
  
  /* 对话框底部按钮区域样式 */
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
  }
}

/* 添加一些动画效果 */
.el-table {
  transition: all 0.3s ease;
  
  /* 表格悬停效果 */
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
}

/* 按钮过渡效果 */
.el-button {
  transition: all 0.3s ease;
}

/* 对话框样式自定义 */
.el-dialog {
  border-radius: 8px;
  overflow: hidden;
  
  /* 使用深度选择器修改Element Plus组件内部样式 */
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