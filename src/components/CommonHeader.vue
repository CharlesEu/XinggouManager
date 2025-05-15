<!-- CommonHeader 组件是后台管理系统的顶部导航栏 -->
<!-- 
1. 核心功能：
   - 提供系统顶部导航栏布局和功能
   - 实现左侧菜单折叠/展开控制
   - 显示面包屑导航，指示当前页面位置
   - 提供用户头像和下拉菜单（个人中心、退出登录）

2. 组件结构：
   - 左侧区域(l-content)：菜单折叠按钮和面包屑导航
   - 右侧区域(r-content)：用户头像和下拉菜单

3. 交互功能：
   - 点击菜单按钮：切换左侧菜单的折叠/展开状态
   - 点击面包屑：导航到对应页面
   - 点击用户头像：显示用户相关操作下拉菜单
   - 点击退出：清除用户状态并返回登录页
-->

<!-- html区域 -->
<template>
    <!-- 顶部导航栏主容器 -->
    <div class="header">
      
      <!-- 左侧内容区：包含菜单折叠按钮和面包屑导航 -->
      <div class="l-content">
        <!-- 菜单折叠/展开按钮 -->
        <el-button size="small" @click="handleCollapse" >
            <component is="menu" class="icons"></component>
        </el-button>
        <!-- 面包屑导航，separator是分隔符-->
        <el-breadcrumb separator="/" class="bread">
          <!-- 首页是一定存在的所以直接写死 -->
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <!-- 动态显示当前页面的面包屑项，仅当current存在时显示 -->
          <el-breadcrumb-item v-if="current" :to="current.path">{{ current.label }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <!-- 右侧内容区：用户头像和下拉菜单 -->
      <div class="r-content">
        <!-- 用户下拉菜单组件 -->
        <el-dropdown>
            <!-- 下拉菜单触发元素：用户头像 -->
            <span class="el-dropdown-link">
              <img :src="getImageUrl('user')" class="user"/>
            </span>
            <!-- 下拉菜单内容 -->
            <template #dropdown>
              <el-dropdown-menu>
                  <!-- 个人中心菜单项 -->
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <!-- 退出登录菜单项，点击时触发handleLoginOut方法 -->
                  <el-dropdown-item @click="handleLoginOut">退出</el-dropdown-item> 
              </el-dropdown-menu>
            </template>
        </el-dropdown>
      </div>

    </div>
</template>

<!-- js区域 -->
<script setup>
  // 导入Vue响应式API和工具函数
  import{ref, computed} from 'vue'
  // 导入状态管理store
  import{ useAllDataStore} from '@/stores'
  // 导入路由功能
  import {useRouter} from 'vue-router'
  
  /**
   * 获取图片URL的工具函数
   * @param {string} user - 图片名称
   * @returns {string} 完整的图片URL路径
   */
  const getImageUrl = (user) => {
    return new URL(`../assets/images/${user}.png`, import.meta.url).href
  }
 
  // 初始化store实例，用于状态管理
  const store = useAllDataStore() 
  
  /**
   * 处理菜单折叠/展开的方法
   * 切换store中isCollapse的状态
   */
  const handleCollapse = () => {
    store.state.isCollapse = !store.state.isCollapse
  }    
  
  // 初始化路由实例
  const router = useRouter()
  
  /**
   * 处理退出登录
   * 1. 清除用户状态
   * 2. 跳转到登录页面
   */
  const handleLoginOut = () => {
    store.clean()
    router.push('/login')
  }
  
  // 计算属性：获取当前菜单信息，用于面包屑导航
  const current = computed(() => store.state.currentMenu)
</script>

<!-- css区域 -->
<style lang="less" scoped>
/* 顶部导航栏容器样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #333;
}

/* 图标样式 */
.icons {
  width: 20px;
  height: 20px;
}

/* 左侧内容区样式 */
.l-content {
  display: flex;
  align-items: center;
  
  /* 按钮右侧间距 */
  .el-button {
    margin-right: 20px;
  }
}

/* 右侧内容区样式 */
.r-content {
  /* 用户头像样式：圆形 */
  .user {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}

/* 面包屑文字颜色样式（使用深度选择器修改Element Plus组件内部样式） */
:deep(.bread span) {
  color: #fff !important;
  cursor: pointer !important;
}
</style>
