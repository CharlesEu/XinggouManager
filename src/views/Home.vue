<!-- 首页仪表盘 -->
<!-- html区域 -->
<template>
  <!-- 首页容器 - 整个仪表盘的最外层容器 -->
  <div class="home-container">
    <!-- 使用Element Plus的栅格系统布局，设置列间距为20px -->
    <el-row class="home" :gutter="20">
      <!-- 左侧区域 - 占据8列宽度，包含用户信息和表格数据 -->
      <el-col :span="8" style="margin-top: 20px">
        <!-- 用户信息卡片 - 显示管理员基本信息和登录记录 -->
        <el-card shadow="hover" class="user-card">
          <!-- 用户基本信息区域 - 头像、用户名和角色标签 -->
          <div class="user">
            <img :src="getImageUrl('user')" class="user-avatar" />
            <div class="user-info">
              <h3 class="user-name">CharlesEu</h3>
              <!-- 使用Element Plus标签组件显示用户角色 -->
              <el-tag size="small" type="success">管理员</el-tag>
            </div>
          </div>
          <!-- 登录信息区域 - 显示上次登录时间和地点 -->
          <div class="login-info">
            <p><i class="el-icon-time"></i>上次登录时间:<span>2025年3月31日</span></p>
            <p><i class="el-icon-location"></i>上次登录地点:<span>辽宁省大连市</span></p>
          </div>
        </el-card>

        <!-- 表格卡片 - 显示课程购买情况数据 -->
        <el-card shadow="hover" class="table-card">
          <!-- 卡片头部 - 标题和刷新按钮 -->
          <template #header>
            <div class="card-header">
              <span>购买情况</span>
              <!-- 刷新按钮 - 点击时重新获取表格数据 -->
              <el-button type="primary" size="small" text @click="getTableData">
                <i class="el-icon-refresh"></i>
              </el-button>
            </div>
          </template>
          <!-- Element Plus表格组件 - 展示课程购买数据 -->
          <el-table :data="tableData" stripe border>
            <!-- 动态生成表格列 - 根据tableLabel对象的键值对生成 -->
            <el-table-column
              v-for="(val, key) in tableLabel"
              :key="key"
              :prop="key"
              :label="val"
            >
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧区域 - 占据16列宽度，包含统计卡片和各类图表 -->
      <el-col :span='16' style="margin-top: 20px">
        <!-- 统计卡片区域 - 展示多个业务指标卡片 -->
        <div class="num">
          <!-- 循环渲染多个统计卡片 - 每个卡片显示一个业务指标 -->
          <el-card
            shadow="hover"
            class="count-card"
            v-for='item in countData'
            :key='item.name'
          >
            <div class="card-content">
              <!-- 动态组件 - 根据item.icon渲染不同的图标 -->
              <component :is="item.icon" class="icons" :style="{background:item.color}"></component>
              <div class="detail">
                <!-- 指标数值和名称 -->
                <p class="value">￥{{item.value}}</p>
                <p class="label">{{item.name}}</p>
                <!-- 进度条 - 显示指标完成情况 -->
                <el-progress :percentage="(item.value / 2000) * 100" :color="item.color" :show-text="false"></el-progress>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 折线图卡片 - 展示订单趋势数据 -->
        <el-card shadow="hover" class="chart-card">
          <!-- 卡片头部 - 标题和时间范围选择器 -->
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
              <!-- 时间范围选择下拉框 -->
              <el-select v-model="chartTimeRange" size="small" placeholder="时间范围">
                <el-option label="最近7天" value="7days"></el-option>
                <el-option label="最近30天" value="30days"></el-option>
                <el-option label="最近90天" value="90days"></el-option>
              </el-select>
            </div>
          </template>
          <!-- 图表容器 - 用于渲染ECharts折线图 -->
          <div ref="echart" style="height: 280px"></div>
        </el-card>

        <!-- 图表区域 - 包含用户增长和销量分布两个图表 -->
        <div class="graph">
          <!-- 用户统计图表卡片 - 展示用户增长数据 -->
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>用户增长</span>
              </div>
            </template>
            <!-- 用户图表容器 - 用于渲染ECharts柱状图 -->
            <div ref="userEchart" style="height: 240px"></div>
          </el-card>

          <!-- 销量统计图表卡片 - 展示销量分布数据 -->
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>销量分布</span>
              </div>
            </template>
            <!-- 销量图表容器 - 用于渲染ECharts饼图 -->
            <div ref="videoEchart" style="height: 240px"></div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<!-- js区域 -->
<script setup>
import { ref, getCurrentInstance, onMounted, reactive } from "vue"
import * as echarts from "echarts"

// 新增状态
const chartTimeRange = ref('7days')

//这个是折线图和柱状图 两个图表共用的公共配置
const xOptions = reactive({
  // 图例文字颜色
  textStyle: {
    color: "#333",
  },
  legend: {
    right: '5%',
  },
  grid: {
    left: "5%",
    right: "5%",
    bottom: "10%",
    top: "15%",
    containLabel: true
  },
  // 提示框
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  xAxis: {
    type: "category", // 类目轴
    data: [],
    axisLine: {
      lineStyle: {
        color: "#17b3a3",
      },
    },
    axisLabel: {
      interval: 0,
      color: "#333",
    },
  },
  yAxis: [
    {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#17b3a3",
        },
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
  ],
  color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
  series: [],
})

//这是饼状图
const pieOptions = reactive({
  tooltip: {
    trigger: "item",
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    type: 'scroll'
  },
  color: [
    "#0f78f4",
    "#dd536b",
    "#9462e5",
    "#a6a6a6",
    "#e1bb22",
    "#39c362",
    "#3ed1cf",
  ],
  series: []
})

const {proxy}=getCurrentInstance()

const getImageUrl=(user)=>{
    return new URL(`../assets/images/${user}.png`,import.meta.url).href
}
const tableData = ref([])
const countData = ref([])

//observer 接收观察器实例对象
const observer = ref(null)

const tableLabel = ref({
    name: "课程",
    todayBuy: "今日购买",
    monthBuy: "本月购买",
    totalBuy: "总购买",
})
const getTableData=async ()=>{
  try {
    const data= await proxy.$api.getTableData()
    tableData.value=data.tableData
  } catch (error) {
    console.error('获取表格数据失败', error)
    // 使用模拟数据
    tableData.value = [
      { name: 'Vue3基础教程', todayBuy: 12, monthBuy: 120, totalBuy: 1200 },
      { name: 'React实战开发', todayBuy: 8, monthBuy: 110, totalBuy: 980 },
      { name: '微信小程序开发', todayBuy: 10, monthBuy: 130, totalBuy: 1050 },
      { name: 'Node.js后端开发', todayBuy: 7, monthBuy: 90, totalBuy: 850 }
    ]
  }
}

const getCountData =async ()=>{
  try {
    const data= await proxy.$api.getCountData()
    countData.value=data
  } catch (error) {
    console.error('获取统计数据失败', error)
    // 使用模拟数据
    countData.value = [
      {
        name: "今日支付订单",
        value: 1234,
        icon: "Money",
        color: "#2ec7c9",
      },
      {
        name: "今日收藏订单",
        value: 210,
        icon: "Star",
        color: "#ffb980",
      },
      {
        name: "今日未支付订单",
        value: 1234,
        icon: "ShoppingCart",
        color: "#5ab1ef",
      },
      {
        name: "本月支付订单",
        value: 4234,
        icon: "Money",
        color: "#2ec7c9",
      },
      {
        name: "本月收藏订单",
        value: 610,
        icon: "Star",
        color: "#ffb980",
      },
      {
        name: "本月未支付订单",
        value: 2234,
        icon: "ShoppingCart",
        color: "#5ab1ef",
      }
    ]
  }
}

const getChartData =async ()=>{
  try {
    const {orderData,userData,videoData}= await proxy.$api.getChartData()
    renderCharts(orderData, userData, videoData)
  } catch (error) {
    console.error('获取图表数据失败', error)
    // 使用模拟数据
    const orderData = {
      date: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
      data: [
        { apple: 120, banana: 200, orange: 150 },
        { apple: 132, banana: 182, orange: 232 },
        { apple: 101, banana: 191, orange: 201 },
        { apple: 134, banana: 234, orange: 154 },
        { apple: 90, banana: 290, orange: 190 },
        { apple: 230, banana: 330, orange: 210 },
        { apple: 210, banana: 310, orange: 150 },
      ]
    }
    
    const userData = [
      { date: '周一', new: 10, active: 100 },
      { date: '周二', new: 15, active: 120 },
      { date: '周三', new: 20, active: 150 },
      { date: '周四', new: 18, active: 140 },
      { date: '周五', new: 25, active: 180 },
      { date: '周六', new: 30, active: 200 },
      { date: '周日', new: 28, active: 190 },
    ]
    
    const videoData = [
      { value: 1048, name: 'Vue' },
      { value: 735, name: 'React' },
      { value: 580, name: 'Angular' },
      { value: 484, name: 'Node.js' },
      { value: 300, name: 'Python' }
    ]
    
    renderCharts(orderData, userData, videoData)
  }
}

// 渲染图表
const renderCharts = (orderData, userData, videoData) => {
  // 渲染折线图
  xOptions.xAxis.data = orderData.date
  xOptions.series = Object.keys(orderData.data[0]).map(val => ({
    name: val,
    data: orderData.data.map(item => item[val]),
    type: 'line',
    smooth: true,
    areaStyle: {
      opacity: 0.2
    },
    emphasis: {
      focus: 'series'
    },
    markPoint: {
      data: [
        { type: 'max', name: '最大值' },
        { type: 'min', name: '最小值' }
      ]
    }
  }))
  const oneEchart = echarts.init(proxy.$refs['echart'])
  oneEchart.setOption(xOptions)

  // 渲染柱状图
  xOptions.xAxis.data = userData.map(item => item.date)
  xOptions.series = [
    {
      name: '新增用户',
      data: userData.map(item => item.new),
      type: 'bar',
      barWidth: '25%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      }
    },
    {
      name: '活跃用户',
      data: userData.map(item => item.active),
      type: 'bar',
      barWidth: '25%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      }
    }
  ]
  const twoEchart = echarts.init(proxy.$refs['userEchart'])
  twoEchart.setOption(xOptions)

  // 渲染饼图
  pieOptions.series = [
    {
      name: '课程分布',
      data: videoData,
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
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
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      }
    }
  ]
  const threeEchart = echarts.init(proxy.$refs['videoEchart'])
  threeEchart.setOption(pieOptions)

  // 监听页面的变化
  observer.value = new ResizeObserver(() => {
    oneEchart.resize()
    twoEchart.resize()
    threeEchart.resize()
  })

  // 容器变化
  if (proxy.$refs['echart']) {
    observer.value.observe(proxy.$refs['echart'])
  }
  if (proxy.$refs['userEchart']) {
    observer.value.observe(proxy.$refs['userEchart'])
  }
  if (proxy.$refs['videoEchart']) {
    observer.value.observe(proxy.$refs['videoEchart'])
  }
}

onMounted(()=>{
  getTableData()
  getCountData()
  getChartData()
})
</script>
   
<!-- css区域 -->
<style lang="less" scoped>
.home-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto; // 保留这个属性确保容器可滚动
}

.home {
  // 移除固定高度和溢出隐藏，允许内容自然流动
  // height: 100%;
  // overflow: hidden;

  // 卡片通用样式
  .el-card {
    border-radius: 8px;
    transition: all 0.3s;
    margin-bottom: 20px;
    
    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  // 用户信息卡片
  .user-card {
    .user {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 20px;
      
      .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right: 25px;
        object-fit: cover;
        border: 3px solid #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .user-info {
        .user-name {
          font-size: 18px;
          margin: 0 0 8px 0;
        }
      }
    }
    
    .login-info {
      p {
        display: flex;
        align-items: center;
        line-height: 30px;
        font-size: 14px;
        color: #606266;
        
        i {
          margin-right: 8px;
          color: #909399;
        }
        
        span {
          color: #303133;
          margin-left: 15px;
        }
      }
    }
  }

  // 表格卡片
  .table-card {
    :deep(.el-table) {
      --el-table-header-bg-color: #f5f7fa;
      
      th {
        font-weight: 600;
      }
    }
  }

  // 统计卡片
  .num {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    
    .count-card {
      width: 32%;
      margin-bottom: 20px;
      
      .card-content {
        display: flex;
        align-items: center;
      }
      
      .icons {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #fff;
        margin-right: 15px;
      }
      
      .detail {
        flex: 1;
        
        .value {
          font-size: 20px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }
      }
    }
  }

  // 图表卡片
  .chart-card {
    height: auto;
  }

  // 图表区域
  .graph {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    
    .el-card {
      width: 48%;
    }
  }
}

// 响应式调整
@media screen and (max-width: 1200px) {
  .home {
    .graph {
      flex-direction: column;
      
      .el-card {
        width: 100%;
      }
    }
    
    .num {
      .count-card {
        width: 48%;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .home {
    .num {
      .count-card {
        width: 100%;
      }
    }
  }
}
</style>