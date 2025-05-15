
<!-- 商品管理界面 组件-->
<!-- html区域 -->
<template>
  <!-- 整个商城管理页面的主容器 -->
  <div class="mall-container">
    <!-- 顶部统计卡片区域 - 展示商品总数、今日销量、本月收入和活跃用户等关键指标 -->
    <div class="stat-cards">
      <!-- 使用Element Plus栅格系统布局，设置卡片间距为20px -->
      <el-row :gutter="20">
        <!-- 循环渲染4个统计卡片，每个占6列（总宽度的1/4） -->
        <el-col :span="6" v-for="(item, index) in statData" :key="index">
          <!-- 卡片组件 - 显示单个统计指标 -->
          <el-card shadow="hover" class="stat-card">
            <div class="card-content">
              <!-- 卡片图标 - 根据数据项显示不同颜色和图标 -->
              <div class="card-icon" :style="{ backgroundColor: item.color }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <!-- 卡片信息区域 - 显示指标标题和数值 -->
              <div class="card-info">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表和操作区域 - 包含销售趋势图和分类占比图 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 左侧销售趋势图 - 占12列（总宽度的1/2） -->
      <el-col :span="12">
        <el-card shadow="hover">
          <!-- 卡片标题 -->
          <template #header>
            <div class="card-header">
              <span>商品销售趋势</span>
            </div>
          </template>
          <!-- 销售趋势图容器 - 用于渲染ECharts折线图 -->
          <div ref="salesChart" class="chart"></div>
        </el-card>
      </el-col>
      <!-- 右侧分类占比图 - 占12列（总宽度的1/2） -->
      <el-col :span="12">
        <el-card shadow="hover">
          <!-- 卡片标题 -->
          <template #header>
            <div class="card-header">
              <span>商品分类占比</span>
            </div>
          </template>
          <!-- 分类占比图容器 - 用于渲染ECharts饼图 -->
          <div ref="categoryChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品列表区域 - 展示所有商品数据并提供管理功能 -->
    <el-card shadow="hover" class="product-list-card">
      <!-- 卡片头部 - 包含标题和搜索筛选功能 -->
      <template #header>
        <div class="list-header">
          <!-- 左侧标题 -->
          <div class="header-left">
            <span class="title">商品列表</span>
          </div>
          <!-- 右侧搜索和操作区域 -->
          <div class="header-right">
            <!-- 商品名称搜索框 -->
            <el-input
              v-model="searchQuery"
              placeholder="搜索商品名称"
              class="search-input"
              clearable
              @clear="handleSearch"
            >
              <!-- 搜索图标 -->
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <!-- 商品分类筛选下拉框 -->
            <el-select v-model="categoryFilter" placeholder="商品分类" clearable @change="handleSearch">
              <!-- 动态生成分类选项 -->
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="dialogVisible = true">
              <el-icon><Plus /></el-icon>添加商品
            </el-button>
          </div>
        </div>
      </template>

      <!-- 商品数据表格 - 展示商品列表数据 -->
      <el-table :data="filteredProducts" stripe style="width: 100%" v-loading="loading">
        <!-- 序号列 -->
        <el-table-column type="index" width="50" />
        <!-- 商品图片列 - 自定义渲染图片并支持预览 -->
        <el-table-column prop="image" label="商品图片" width="100">
          <template #default="scope">
            <el-image
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              class="product-image"
            />
          </template>
        </el-table-column>
        <!-- 商品名称列 -->
        <el-table-column prop="name" label="商品名称" />
        <!-- 商品分类列 -->
        <el-table-column prop="category" label="分类" width="120" />
        <!-- 商品价格列 - 自定义渲染价格格式 -->
        <el-table-column prop="price" label="价格" width="120">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <!-- 商品库存列 -->
        <el-table-column prop="stock" label="库存" width="100" />
        <!-- 商品销量列 -->
        <el-table-column prop="sales" label="销量" width="100" />
        <!-- 商品状态列 - 使用标签显示上架/下架状态 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'info'">
              {{ scope.row.status ? '上架中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作列 - 提供编辑、上下架和删除功能 -->
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <!-- 编辑按钮 -->
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <!-- 上下架按钮 - 根据当前状态动态显示 -->
            <el-button
              size="small"
              :type="scope.row.status ? 'warning' : 'success'"
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status ? '下架' : '上架' }}
            </el-button>
            <!-- 删除按钮 -->
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 提供分页功能 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalProducts"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑商品对话框 - 用于新增或修改商品信息 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="50%"
      destroy-on-close
    >
      <!-- 商品表单 - 包含商品的各项属性输入 -->
      <el-form :model="productForm" :rules="rules" ref="productFormRef" label-width="100px">
        <!-- 商品名称输入 -->
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <!-- 商品分类选择 -->
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择商品分类" style="width: 100%">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- 商品价格输入 - 使用数字输入框并限制精度 -->
        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="productForm.price" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <!-- 商品库存输入 - 使用数字输入框 -->
        <el-form-item label="商品库存" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>
        <!-- 商品图片上传 -->
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleUpload"
          >
            <!-- 显示已上传图片或上传图标 -->
            <img v-if="productForm.image" :src="productForm.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <!-- 商品描述输入 - 使用多行文本框 -->
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <!-- 商品状态开关 - 控制商品上下架状态 -->
        <el-form-item label="商品状态" prop="status">
          <el-switch v-model="productForm.status" :active-value="true" :inactive-value="false" />
          <span class="status-text">{{ productForm.status ? '上架' : '下架' }}</span>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 - 取消和确认按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<!-- js区域 -->
<script setup>
import { ref, getCurrentInstance, onMounted, reactive } from "vue";
import * as echarts from "echarts";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Plus,
  Delete,
  Edit,
  ShoppingCart,
  Goods,
  Money,
  User
} from "@element-plus/icons-vue";

// 统计数据
const statData = reactive([
  { title: "商品总数", value: 256, icon: "Goods", color: "#409EFF" },
  { title: "今日销量", value: 128, icon: "ShoppingCart", color: "#67C23A" },
  { title: "本月收入", value: "¥25,648", icon: "Money", color: "#E6A23C" },
  { title: "活跃用户", value: 1024, icon: "User", color: "#F56C6C" }
]);

// 商品分类
const categories = [
  { value: "电子产品", label: "电子产品" },
  { value: "服装", label: "服装" },
  { value: "食品", label: "食品" },
  { value: "家居", label: "家居" },
  { value: "美妆", label: "美妆" }
];

// 表格数据
const loading = ref(false);
const products = ref([
  {
    id: 1,
    name: "iPhone 13 Pro",
    category: "电子产品",
    price: 7999,
    stock: 100,
    sales: 50,
    status: true,
    image: "https://img2.baidu.com/it/u=1303806583,1571575659&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    description: "Apple iPhone 13 Pro 256GB 远峰蓝色"
  },
  {
    id: 2,
    name: "MacBook Pro",
    category: "电子产品",
    price: 12999,
    stock: 50,
    sales: 30,
    status: true,
    image: "https://img1.baidu.com/it/u=1645832847,2375101130&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333",
    description: "Apple MacBook Pro 14英寸 M1 Pro芯片"
  },
  {
    id: 3,
    name: "Nike Air Max",
    category: "服装",
    price: 1299,
    stock: 200,
    sales: 150,
    status: true,
    image: "https://img0.baidu.com/it/u=2388680771,1906130127&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    description: "Nike Air Max 270 运动鞋"
  },
  {
    id: 4,
    name: "小米手环7",
    category: "电子产品",
    price: 249,
    stock: 500,
    sales: 300,
    status: true,
    image: "https://img2.baidu.com/it/u=3519867636,2198335270&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    description: "小米手环7 NFC版 黑色"
  },
  {
    id: 5,
    name: "华为Mate50",
    category: "电子产品",
    price: 5999,
    stock: 80,
    sales: 60,
    status: false,
    image: "https://img1.baidu.com/it/u=3004138488,1671756220&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    description: "华为Mate50 Pro 256GB 曜金黑"
  }
]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const totalProducts = ref(products.value.length);

// 搜索和筛选
const searchQuery = ref("");
const categoryFilter = ref("");

// 过滤后的商品列表
const filteredProducts = ref([...products.value]);

// 处理搜索和筛选
const handleSearch = () => {
  filteredProducts.value = products.value.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchCategory = !categoryFilter.value || item.category === categoryFilter.value;
    return matchName && matchCategory;
  });
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 商品表单相关
const dialogVisible = ref(false);
const isEdit = ref(false);
const productFormRef = ref(null);
const productForm = reactive({
  id: null,
  name: "",
  category: "",
  price: 0,
  stock: 0,
  sales: 0,
  status: true,
  image: "",
  description: ""
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择商品分类", trigger: "change" }],
  price: [{ required: true, message: "请输入商品价格", trigger: "blur" }],
  stock: [{ required: true, message: "请输入商品库存", trigger: "blur" }],
  image: [{ required: true, message: "请上传商品图片", trigger: "change" }]
};

// 编辑商品
const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(productForm, JSON.parse(JSON.stringify(row)));
  dialogVisible.value = true;
};

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      products.value = products.value.filter(item => item.id !== row.id);
      filteredProducts.value = filteredProducts.value.filter(item => item.id !== row.id);
      totalProducts.value = products.value.length;
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

// 修改商品状态
const handleStatusChange = (row) => {
  const statusText = row.status ? "下架" : "上架";
  ElMessageBox.confirm(`确定要${statusText}该商品吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      row.status = !row.status;
      ElMessage.success(`${statusText}成功`);
    })
    .catch(() => {});
};

// 图片上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error("上传头像图片只能是 JPG 或 PNG 格式!");
  }
  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
  }
  return isJPG && isLt2M;
};

// 模拟图片上传
const handleUpload = (options) => {
  // 实际项目中这里应该调用上传API
  // 这里使用FileReader模拟上传效果
  const reader = new FileReader();
  reader.readAsDataURL(options.file);
  reader.onload = () => {
    productForm.image = reader.result;
    ElMessage.success("上传成功");
  };
};

// 提交表单
const submitForm = () => {
  productFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑现有商品
        const index = products.value.findIndex(item => item.id === productForm.id);
        if (index !== -1) {
          products.value[index] = { ...productForm };
          ElMessage.success("商品更新成功");
        }
      } else {
        // 添加新商品
        const newProduct = { ...productForm };
        newProduct.id = products.value.length + 1;
        newProduct.sales = 0;
        products.value.push(newProduct);
        totalProducts.value = products.value.length;
        ElMessage.success("商品添加成功");
      }
      handleSearch(); // 刷新筛选结果
      dialogVisible.value = false;
    } else {
      return false;
    }
  });
};

// 图表相关
const salesChart = ref(null);
const categoryChart = ref(null);

onMounted(() => {
  // 初始化销售趋势图表
  const salesChartInstance = echarts.init(salesChart.value);
  salesChartInstance.setOption({
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '订单量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        stack: '总量',
        data: [5000, 6200, 8100, 7800, 11000, 14000, 19000],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.7)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        }
      },
      {
        name: '订单量',
        type: 'line',
        stack: '总量',
        data: [120, 132, 101, 134, 190, 230, 210],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#67C23A'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(103, 194, 58, 0.7)'
              },
              {
                offset: 1,
                color: 'rgba(103, 194, 58, 0.1)'
              }
            ]
          }
        }
      }
    ]
  });

  // 初始化分类占比图表
  const categoryChartInstance = echarts.init(categoryChart.value);
  categoryChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['电子产品', '服装', '食品', '家居', '美妆']
    },
    series: [
      {
        name: '商品分类',
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
        data: [
          { value: 40, name: '电子产品' },
          { value: 25, name: '服装' },
          { value: 15, name: '食品' },
          { value: 12, name: '家居' },
          { value: 8, name: '美妆' }
        ]
      }
    ]
  });

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener('resize', () => {
    salesChartInstance.resize();
    categoryChartInstance.resize();
  });
});
</script>
   
<!-- css区域 -->
<style lang="less" scoped>
.mall-container {
  padding: 20px;

  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      .card-content {
        display: flex;
        align-items: center;

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 15px;

          .el-icon {
            font-size: 30px;
            color: white;
          }
        }

        .card-info {
          .card-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 5px;
          }

          .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }
  }

  .chart-section {
    margin-bottom: 20px;

    .chart {
      height: 300px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
  }

  .product-list-card {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 18px;
        font-weight: bold;
      }

      .header-right {
        display: flex;
        gap: 10px;

        .search-input {
          width: 200px;
        }
      }
    }

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 4px;
    }

    .price {
      color: #f56c6c;
      font-weight: bold;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .avatar-uploader {
    .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
      line-height: 178px;
    }

    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
  }

  .status-text {
    margin-left: 10px;
    color: #606266;
  }
}
</style>

<!-- 这个商品管理界面包含以下功能和特点：

1. 顶部统计卡片 ：展示商品总数、今日销量、本月收入和活跃用户等关键指标
2. 数据可视化图表 ：
   - 商品销售趋势图（折线图）
   - 商品分类占比图（环形图）
3. 商品列表功能 ：
   - 搜索功能（按商品名称）
   - 分类筛选
   - 分页功能
   - 商品状态管理（上架/下架）
4. 商品管理功能 ：
   - 添加新商品
   - 编辑现有商品
   - 删除商品
   - 修改商品状态
5. UI设计 elementplus ：
   - 卡片式布局
   - 响应式设计
   - 图片预览功能
   - 合理的色彩搭配 -->