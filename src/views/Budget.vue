<template>
    <!-- 预算管理页面的主容器 -->
    <div class="budget-container">
      <!-- 页面标题（已注释掉） -->
      <!-- <h2 class="page-title">预算管理</h2> -->
      
      <!-- 预算周期选择区域 - 用于选择预算的时间范围（月度/季度/年度） -->
      <div class="period-selector">
        <!-- 预算周期类型选择按钮组 -->
        <el-radio-group v-model="currentPeriod" @change="changePeriod">
          <el-radio-button label="month">月度预算</el-radio-button>
          <el-radio-button label="quarter">季度预算</el-radio-button>
          <el-radio-button label="year">年度预算</el-radio-button>
        </el-radio-group>
        
        <!-- 预算周期具体时间选择和操作按钮区域 -->
        <div class="period-actions">
          <!-- 年份选择下拉框 -->
          <el-select v-model="selectedYear" placeholder="选择年份" @change="changePeriod">
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="year + '年'"
              :value="year"
            />
          </el-select>
          
          <!-- 月份/季度选择下拉框（根据当前选择的预算周期类型显示） -->
          <el-select 
            v-if="currentPeriod !== 'year'" 
            v-model="selectedPeriodNumber" 
            :placeholder="currentPeriod === 'month' ? '选择月份' : '选择季度'"
            @change="changePeriod"
          >
            <el-option
              v-for="item in periodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          
          <!-- 创建预算按钮 -->
          <el-button type="primary" @click="createBudget">创建预算</el-button>
        </div>
      </div>
      
      <!-- 预算概览卡片 - 显示当前周期的预算总览信息 -->
      <el-card shadow="hover" class="budget-overview">
        <!-- 概览卡片头部 - 标题和操作按钮 -->
        <div class="overview-header">
          <!-- 当前预算周期标题 -->
          <h3>{{ periodTitle }}预算概览</h3>
          <!-- 预算操作按钮组 -->
          <div class="overview-actions">
            <el-button size="small" @click="approveBudget">批准预算</el-button>
            <el-button size="small" type="primary" @click="exportBudget">导出预算</el-button>
          </div>
        </div>
        
        <!-- 预算概览数据卡片组 - 展示总预算、已使用、已提交和剩余预算 -->
        <el-row :gutter="20" class="overview-cards">
          <!-- 循环渲染4个预算概览卡片 -->
          <el-col :span="6" v-for="(item, index) in budgetOverview" :key="index">
            <div class="overview-item">
              <!-- 概览项标题 -->
              <div class="item-title">{{ item.title }}</div>
              <!-- 概览项数值 -->
              <div class="item-value">{{ item.value }}</div>
              <!-- 概览项进度条 - 显示预算使用进度 -->
              <el-progress 
                :percentage="item.percentage" 
                :color="item.color"
                :status="item.status"
                :stroke-width="10"
              />
            </div>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 部门预算表格卡片 - 展示各部门预算分配和使用情况 -->
      <el-card shadow="hover" class="budget-table-card">
        <!-- 卡片头部 - 标题和添加部门按钮 -->
        <template #header>
          <div class="card-header">
            <span>部门预算分配</span>
            <el-button type="primary" size="small" @click="addDepartment">添加部门</el-button>
          </div>
        </template>
        
        <!-- 部门预算数据表格 -->
        <el-table :data="departmentBudgets" border style="width: 100%">
          <!-- 部门名称列 -->
          <el-table-column prop="department" label="部门" width="180" />
          <!-- 负责人列 -->
          <el-table-column prop="manager" label="负责人" width="120" />
          <!-- 预算金额列 - 自定义格式化金额显示 -->
          <el-table-column prop="budget" label="预算金额" width="150">
            <template #default="scope">
              <span>¥{{ formatNumber(scope.row.budget) }}</span>
            </template>
          </el-table-column>
          <!-- 已使用金额列 - 自定义格式化金额显示 -->
          <el-table-column prop="spent" label="已使用" width="150">
            <template #default="scope">
              <span>¥{{ formatNumber(scope.row.spent) }}</span>
            </template>
          </el-table-column>
          <!-- 剩余预算列 - 自定义格式化金额显示，负值显示红色 -->
          <el-table-column prop="remaining" label="剩余预算" width="150">
            <template #default="scope">
              <span :class="scope.row.remaining < 0 ? 'negative-amount' : ''">
                ¥{{ formatNumber(scope.row.remaining) }}
              </span>
            </template>
          </el-table-column>
          <!-- 使用进度列 - 显示预算使用进度条 -->
          <el-table-column label="使用进度" width="200">
            <template #default="scope">
              <el-progress 
                :percentage="Math.min(Math.round(scope.row.spent / scope.row.budget * 100), 100)" 
                :status="scope.row.spent > scope.row.budget ? 'exception' : ''"
              />
            </template>
          </el-table-column>
          <!-- 状态列 - 使用不同颜色标签显示预算状态 -->
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <!-- 操作列 - 提供编辑、查看明细和删除功能 -->
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="editBudget(scope.row)">编辑</el-button>
              <el-button size="small" type="primary" @click="viewDetails(scope.row)">明细</el-button>
              <el-button size="small" type="danger" @click="deleteBudget(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <!-- 预算分析图表区域 - 使用图表可视化预算数据 -->
      <el-row :gutter="20" class="budget-charts">
        <!-- 左侧饼图 - 部门预算分配比例 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>部门预算分配</span>
              </div>
            </template>
            <!-- 饼图容器 - 用于渲染ECharts饼图 -->
            <div ref="pieChart" class="chart"></div>
          </el-card>
        </el-col>
        <!-- 右侧柱状图 - 预算执行情况对比 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>预算执行情况</span>
              </div>
            </template>
            <!-- 柱状图容器 - 用于渲染ECharts柱状图 -->
            <div ref="barChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 添加/编辑预算对话框 - 用于新增或修改部门预算 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑部门预算' : '添加部门预算'"
        width="50%"
      >
        <!-- 预算表单 - 包含预算的各项属性输入 -->
        <el-form :model="budgetForm" :rules="rules" ref="budgetFormRef" label-width="100px">
          <!-- 部门选择 -->
          <el-form-item label="部门" prop="department">
            <el-select v-model="budgetForm.department" placeholder="请选择部门" style="width: 100%">
              <el-option
                v-for="item in departmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <!-- 负责人选择 -->
          <el-form-item label="负责人" prop="manager">
            <el-select v-model="budgetForm.manager" placeholder="请选择负责人" style="width: 100%">
              <el-option
                v-for="item in managerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <!-- 预算金额输入 - 使用数字输入框并限制精度 -->
          <el-form-item label="预算金额" prop="budget">
            <el-input-number v-model="budgetForm.budget" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
          <!-- 预算说明输入 - 使用多行文本框 -->
          <el-form-item label="预算说明" prop="description">
            <el-input
              v-model="budgetForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入预算说明"
            />
          </el-form-item>
          <!-- 预算状态选择 -->
          <el-form-item label="状态" prop="status">
            <el-select v-model="budgetForm.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="草稿" />
              <el-option label="待审批" value="待审批" />
              <el-option label="已审批" value="已审批" />
              <el-option label="已拒绝" value="已拒绝" />
            </el-select>
          </el-form-item>
        </el-form>
        <!-- 对话框底部按钮 - 取消和确认按钮 -->
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitBudget">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  // 预算周期
  const currentPeriod = ref('month');
  const selectedYear = ref(new Date().getFullYear());
  const selectedPeriodNumber = ref(new Date().getMonth() + 1);
  
  // 年份选项
  const yearOptions = [2022, 2023, 2024, 2025];
  
  // 周期选项
  const periodOptions = computed(() => {
    if (currentPeriod.value === 'month') {
      return Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}月`
      }));
    } else if (currentPeriod.value === 'quarter') {
      return Array.from({ length: 4 }, (_, i) => ({
        value: i + 1,
        label: `第${i + 1}季度`
      }));
    }
    return [];
  });
  
  // 当前周期标题
  const periodTitle = computed(() => {
    if (currentPeriod.value === 'month') {
      return `${selectedYear.value}年${selectedPeriodNumber.value}月`;
    } else if (currentPeriod.value === 'quarter') {
      return `${selectedYear.value}年第${selectedPeriodNumber.value}季度`;
    } else {
      return `${selectedYear.value}年`;
    }
  });
  
  // 预算概览数据
  const budgetOverview = reactive([
    {
      title: '总预算',
      value: '¥1,200,000',
      percentage: 100,
      color: '#409EFF',
      status: ''
    },
    {
      title: '已使用',
      value: '¥780,000',
      percentage: 65,
      color: '#67C23A',
      status: ''
    },
    {
      title: '已提交',
      value: '¥120,000',
      percentage: 10,
      color: '#E6A23C',
      status: ''
    },
    {
      title: '剩余预算',
      value: '¥300,000',
      percentage: 25,
      color: '#909399',
      status: ''
    }
  ]);
  
  // 部门预算数据
  const departmentBudgets = ref([
    {
      id: 1,
      department: '市场部',
      manager: '张三',
      budget: 300000,
      spent: 210000,
      remaining: 90000,
      status: '已审批'
    },
    {
      id: 2,
      department: '研发部',
      manager: '李四',
      budget: 500000,
      spent: 350000,
      remaining: 150000,
      status: '已审批'
    },
    {
      id: 3,
      department: '销售部',
      manager: '王五',
      budget: 200000,
      spent: 180000,
      remaining: 20000,
      status: '已审批'
    },
    {
      id: 4,
      department: '人力资源部',
      manager: '赵六',
      budget: 100000,
      spent: 40000,
      remaining: 60000,
      status: '待审批'
    },
    {
      id: 5,
      department: '财务部',
      manager: '钱七',
      budget: 100000,
      spent: 120000,
      remaining: -20000,
      status: '已审批'
    }
  ]);
  
  // 部门选项
  const departmentOptions = [
    { value: '市场部', label: '市场部' },
    { value: '研发部', label: '研发部' },
    { value: '销售部', label: '销售部' },
    { value: '人力资源部', label: '人力资源部' },
    { value: '财务部', label: '财务部' },
    { value: '行政部', label: '行政部' }
  ];
  
  // 负责人选项
  const managerOptions = [
    { value: '张三', label: '张三' },
    { value: '李四', label: '李四' },
    { value: '王五', label: '王五' },
    { value: '赵六', label: '赵六' },
    { value: '钱七', label: '钱七' },
    { value: '孙八', label: '孙八' }
  ];
  
  // 图表引用
  const pieChart = ref(null);
  const barChart = ref(null);
  
  // 对话框相关
  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const budgetFormRef = ref(null);
  const budgetForm = reactive({
    id: null,
    department: '',
    manager: '',
    budget: 0,
    spent: 0,
    remaining: 0,
    description: '',
    status: '草稿'
  });
  
  // 表单验证规则
  const rules = {
    department: [{ required: true, message: '请选择部门', trigger: 'change' }],
    manager: [{ required: true, message: '请选择负责人', trigger: 'change' }],
    budget: [{ required: true, message: '请输入预算金额', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

// 切换预算周期
const changePeriod = () => {
  // 这里可以根据选择的周期获取对应的预算数据
  initCharts();
};

// 创建预算
const createBudget = () => {
  isEdit.value = false;
  budgetForm.id = null;
  budgetForm.department = '';
  budgetForm.manager = '';
  budgetForm.budget = 0;
  budgetForm.spent = 0;
  budgetForm.remaining = 0;
  budgetForm.description = '';
  budgetForm.status = '草稿';
  dialogVisible.value = true;
};

// 编辑预算
const editBudget = (row) => {
  isEdit.value = true;
  Object.assign(budgetForm, JSON.parse(JSON.stringify(row)));
  dialogVisible.value = true;
};

// 查看明细
const viewDetails = (row) => {
  ElMessage.info(`查看 ${row.department} 的预算明细`);
  // 这里可以跳转到明细页面或打开明细对话框
};

// 删除预算
const deleteBudget = (row) => {
  ElMessageBox.confirm(`确定要删除 ${row.department} 的预算吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      departmentBudgets.value = departmentBudgets.value.filter(item => item.id !== row.id);
      ElMessage.success('删除成功');
      initCharts();
    })
    .catch(() => {});
};

// 批准预算
const approveBudget = () => {
  ElMessage.success('预算已批准');
};

// 导出预算
const exportBudget = () => {
  ElMessage.success('预算已导出');
};

// 提交预算表单
const submitBudget = () => {
  budgetFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑现有预算
        const index = departmentBudgets.value.findIndex(item => item.id === budgetForm.id);
        if (index !== -1) {
          // 计算剩余预算
          budgetForm.remaining = budgetForm.budget - budgetForm.spent;
          departmentBudgets.value[index] = { ...budgetForm };
          ElMessage.success('预算更新成功');
        }
      } else {
        // 添加新预算
        const newBudget = { ...budgetForm };
        newBudget.id = departmentBudgets.value.length + 1;
        newBudget.spent = 0;
        newBudget.remaining = newBudget.budget;
        departmentBudgets.value.push(newBudget);
        ElMessage.success('预算添加成功');
      }
      initCharts();
      dialogVisible.value = false;
    } else {
      return false;
    }
  });
};

// 添加部门
const addDepartment = () => {
  createBudget();
};

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case '已审批':
      return 'success';
    case '待审批':
      return 'warning';
    case '已拒绝':
      return 'danger';
    default:
      return 'info';
  }
};

// 初始化图表
const initCharts = () => {
  // 饼图 - 部门预算分配
  const pieChartInstance = echarts.init(pieChart.value);
  const pieData = departmentBudgets.value.map(item => ({
    name: item.department,
    value: item.budget
  }));
  
  pieChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: departmentBudgets.value.map(item => item.department)
    },
    series: [
      {
        name: '预算分配',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  });
  
  // 柱状图 - 预算执行情况
  const barChartInstance = echarts.init(barChart.value);
  barChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['预算金额', '已使用', '剩余预算']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: departmentBudgets.value.map(item => item.department)
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '预算金额',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#409EFF'
        },
        data: departmentBudgets.value.map(item => item.budget)
      },
      {
        name: '已使用',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#67C23A'
        },
        data: departmentBudgets.value.map(item => item.spent)
      },
      {
        name: '剩余预算',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: function(params) {
            const value = departmentBudgets.value[params.dataIndex].remaining;
            return value < 0 ? '#F56C6C' : '#E6A23C';
          }
        },
        data: departmentBudgets.value.map(item => item.remaining)
      }
    ]
  });
  
  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener('resize', () => {
    pieChartInstance.resize();
    barChartInstance.resize();
  });
};

onMounted(() => {
  initCharts();
});
</script>

<style lang="less" scoped>
.budget-container {
  padding: 20px;
  
  .page-title {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }
  
  .period-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;
    
    .period-actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .budget-overview {
    margin-bottom: 20px;
    
    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
      
      .overview-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .overview-cards {
      .overview-item {
        padding: 15px;
        background-color: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 15px;
        
        .item-title {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }
        
        .item-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 10px;
        }
      }
    }
  }
  
  .budget-table-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
    
    .negative-amount {
      color: #F56C6C;
    }
  }
  
  .budget-charts {
    margin-bottom: 20px;
    
    .chart-card {
      .chart {
        height: 300px;
      }
    }
  }
}
</style>
