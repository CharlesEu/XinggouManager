<template>
  <!-- 财务报表容器 - 整个财务模块的最外层容器 -->
  <div class="report-container">
    <!-- 页面标题（已注释掉） -->
    <!-- <h2 class="page-title">财务报表分析</h2> -->
    
    <!-- 筛选条件区域 - 用于设置报表的筛选参数 -->
    <div class="filter-container">
      <!-- 内联表单 - 横向排列的筛选表单 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <!-- 日期范围选择器 - 用于选择报表的时间范围 -->
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <!-- 报表类型选择器 - 用于选择收入/支出/利润报表 -->
        <el-form-item label="报表类型">
          <el-select v-model="filterForm.reportType" placeholder="请选择报表类型">
            <el-option label="收入报表" value="income" />
            <el-option label="支出报表" value="expense" />
            <el-option label="利润报表" value="profit" />
          </el-select>
        </el-form-item>
        <!-- 操作按钮组 - 生成报表和导出报表按钮 -->
        <el-form-item>
          <el-button type="primary" @click="generateReport">生成报表</el-button>
          <el-button @click="exportReport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 数据概览卡片区域 - 展示关键财务指标 -->
    <div class="data-overview">
      <!-- 使用Element Plus栅格系统布局，设置卡片间距为20px -->
      <el-row :gutter="20">
        <!-- 循环渲染4个数据概览卡片，每个占6列（总宽度的1/4） -->
        <el-col :span="6" v-for="(item, index) in overviewData" :key="index">
          <!-- 卡片组件 - 显示单个财务指标 -->
          <el-card shadow="hover" class="overview-card">
            <div class="card-content">
              <!-- 卡片图标 - 根据数据项显示不同颜色和图标 -->
              <div class="card-icon" :style="{ backgroundColor: item.color }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <!-- 卡片信息区域 - 显示指标标题、数值和同比变化 -->
              <div class="card-info">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-value">{{ item.value }}</div>
                <!-- 同比变化指标 - 根据上升/下降显示不同颜色和箭头 -->
                <div class="card-compare" :class="item.trend">
                  <el-icon v-if="item.trend === 'up'"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                  {{ item.compare }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 - 包含多个财务数据可视化图表 -->
    <div class="chart-container">
      <!-- 第一行图表 - 收入支出趋势和收入来源分布 -->
      <el-row :gutter="20">
        <!-- 左侧趋势图 - 占12列（总宽度的1/2） -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <!-- 卡片标题 -->
            <template #header>
              <div class="card-header">
                <span>收入支出趋势</span>
              </div>
            </template>
            <!-- 趋势图容器 - 用于渲染ECharts折线图 -->
            <div ref="trendChart" class="chart"></div>
          </el-card>
        </el-col>
        <!-- 右侧饼图 - 占12列（总宽度的1/2） -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <!-- 卡片标题 -->
            <template #header>
              <div class="card-header">
                <span>收入来源分布</span>
              </div>
            </template>
            <!-- 饼图容器 - 用于渲染ECharts饼图 -->
            <div ref="pieChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 第二行图表 - 月度财务对比 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 柱状图 - 占24列（整行宽度） -->
        <el-col :span="24">
          <el-card shadow="hover" class="chart-card">
            <!-- 卡片标题 -->
            <template #header>
              <div class="card-header">
                <span>月度财务对比</span>
              </div>
            </template>
            <!-- 柱状图容器 - 用于渲染ECharts柱状图 -->
            <div ref="barChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { ArrowUp, ArrowDown, Money, Wallet, TrendCharts, Coin } from '@element-plus/icons-vue';
  
  // 筛选表单数据
  const filterForm = reactive({
    dateRange: ['2023-01-01', '2023-12-31'],
    reportType: 'income'
  });
  
  // 数据概览
  const overviewData = reactive([
    { 
      title: '总收入', 
      value: '¥128,560', 
      compare: '12.5%', 
      trend: 'up', 
      icon: 'Money', 
      color: '#67C23A' 
    },
    { 
      title: '总支出', 
      value: '¥85,230', 
      compare: '8.3%', 
      trend: 'up', 
      icon: 'Wallet', 
      color: '#F56C6C' 
    },
    { 
      title: '净利润', 
      value: '¥43,330', 
      compare: '15.2%', 
      trend: 'up', 
      icon: 'TrendCharts', 
      color: '#409EFF' 
    },
    { 
      title: '资产回报率', 
      value: '24.6%', 
      compare: '3.8%', 
      trend: 'down', 
      icon: 'Coin', 
      color: '#E6A23C' 
    }
  ]);
  
  // 图表引用
  const trendChart = ref(null);
  const pieChart = ref(null);
  const barChart = ref(null);
  
  // 生成报表
  const generateReport = () => {
    // 这里可以根据筛选条件重新获取数据并更新图表
    initCharts();
  };
  
  // 导出报表
  const exportReport = () => {
    // 实现导出功能
  };
  
  // 初始化图表
  const initCharts = () => {
    // 趋势图
    const trendChartInstance = echarts.init(trendChart.value);
    trendChartInstance.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['收入', '支出', '利润']
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
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: [12000, 13200, 10100, 13400, 19000, 23000, 21000, 19500, 17000, 16800, 15000, 14000],
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#67C23A'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
              ]
            }
          }
        },
        {
          name: '支出',
          type: 'line',
          data: [8000, 9000, 9000, 8500, 12000, 14000, 13000, 12500, 10500, 10000, 9500, 9000],
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#F56C6C'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
                { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
              ]
            }
          }
        },
        {
          name: '利润',
          type: 'line',
          data: [4000, 4200, 1100, 4900, 7000, 9000, 8000, 7000, 6500, 6800, 5500, 5000],
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#409EFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ]
            }
          }
        }
      ]
    });
    
    // 饼图
    const pieChartInstance = echarts.init(pieChart.value);
    pieChartInstance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: ['产品销售', '服务收入', '投资收益', '其他收入']
      },
      series: [
        {
          name: '收入来源',
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
            { value: 65000, name: '产品销售' },
            { value: 35000, name: '服务收入' },
            { value: 20000, name: '投资收益' },
            { value: 8560, name: '其他收入' }
          ]
        }
      ]
    });
    
    // 柱状图
    const barChartInstance = echarts.init(barChart.value);
    barChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['收入', '支出', '利润']
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
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '收入',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#67C23A'
          },
          data: [12000, 13200, 10100, 13400, 19000, 23000, 21000, 19500, 17000, 16800, 15000, 14000]
        },
        {
          name: '支出',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#F56C6C'
          },
          data: [8000, 9000, 9000, 8500, 12000, 14000, 13000, 12500, 10500, 10000, 9500, 9000]
        },
        {
          name: '利润',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#409EFF'
          },
          data: [4000, 4200, 1100, 4900, 7000, 9000, 8000, 7000, 6500, 6800, 5500, 5000]
        }
      ]
    });
    
    // 监听窗口大小变化，重新调整图表大小
    window.addEventListener('resize', () => {
      trendChartInstance.resize();
      pieChartInstance.resize();
      barChartInstance.resize();
    });
  };
  
  onMounted(() => {
    initCharts();
  });
  </script>
  
  <style lang="less" scoped>
  .report-container {
    padding: 20px;
    
    .page-title {
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }
    
    .filter-container {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f5f7fa;
      border-radius: 8px;
      
      .filter-form {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }
    }
    
    .data-overview {
      margin-bottom: 20px;
      
      .overview-card {
        margin-bottom: 20px;
        
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
              margin-bottom: 5px;
            }
            
            .card-compare {
              font-size: 12px;
              display: flex;
              align-items: center;
              
              &.up {
                color: #67C23A;
              }
              
              &.down {
                color: #F56C6C;
              }
              
              .el-icon {
                margin-right: 5px;
              }
            }
          }
        }
      }
    }
    
    .chart-container {
      .chart-card {
        margin-bottom: 20px;
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        
        .chart {
          height: 300px;
        }
      }
    }
  }
  </style>