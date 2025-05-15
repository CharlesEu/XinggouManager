<!-- 
后台管理系统侧边栏组件 - 左侧导航菜单

1. 核心功能：
   - 显示系统的主要导航菜单
   - 支持菜单的折叠/展开功能
   - 处理菜单项的点击事件和路由跳转
   - 根据路由状态高亮当前活动菜单项

2. 组件结构：
   - 使用Element Plus的el-aside和el-menu组件构建
   - 分为两类菜单项：无子菜单的直接显示，有子菜单的使用折叠面板
   - 动态根据折叠状态调整侧边栏宽度

3. 数据来源：
   - 菜单数据从全局状态管理中获取
   - 菜单项包含路径、图标和标签等信息

4. 交互特性：
   - 点击菜单项触发路由跳转
   - 当前路由对应的菜单项会高亮显示
   - 响应全局的折叠/展开状态变化
-->

<!-- html区域 -->
<template>
    <!-- 侧边栏容器，宽度根据折叠状态动态计算 -->
    <el-aside :width="width">
        <!-- 菜单组件，配置背景色、文字颜色和折叠状态 -->
        <el-menu
            background-color="#545c64"
            text-color="#fff"
            :collapse="isCollapse"
            :collapse-transition="false"
            :default-active="activeMenu"
        >
            <!-- 系统标题，仅在展开状态显示 -->
            <h2 v-show="!isCollapse">星购管理平台</h2>
            <!-- 折叠状态的简化标题（已注释） -->
            <!-- <h3 v-show="isCollapse">后台</h3> -->
            
            <!-- 无子菜单的菜单项循环渲染 -->
            <el-menu-item 
                v-for="item in noChildren"
                :index='item.path'
                :key='item.path'
                @click="handleMenu(item)"
            >
                <!-- 菜单图标，动态组件 -->
                <component class="icons" :is="item.icon"></component>
                <!-- 菜单文本 -->
                <span>{{ item.label }}</span>
            </el-menu-item>

            <!-- 有子菜单的菜单项循环渲染 -->
            <el-sub-menu 
                v-for="item in hasChildren"
                :index='item.path'
                :key='item.path'
            >
                <!-- 父级菜单标题 -->
                <template #title>
                    <component class='icons' :is="item.icon"></component>
                    <span>{{item.label}}</span>
                </template>

                <!-- 子菜单组 -->
                <el-menu-item-group>
                    <!-- 子菜单项循环渲染 -->
                    <el-menu-item
                        v-for="(subItem,subIndex) in item.children"
                        :index='subItem.path'
                        :key='subItem.path'
                        @click="handleMenu(subItem)"
                    >
                        <!-- 子菜单图标 -->
                        <component class='icons' :is="subItem.icon"></component>
                        <!-- 子菜单文本 -->
                        <span>{{subItem.label}}</span>
                    </el-menu-item>
                </el-menu-item-group>
            </el-sub-menu>
        </el-menu>
    </el-aside>
</template>

<!-- js区域 -->
<script setup>
    // 导入Vue响应式API
    import{ref, computed} from 'vue'
    // 导入路由相关功能
    import {useRoute, useRouter} from 'vue-router'
    // 导入状态管理store
    import{ useAllDataStore} from '@/stores'

    // 初始化store实例
    const store = useAllDataStore() 
    
    /**
     * 计算属性：获取菜单列表数据
     * 从全局状态管理中获取菜单数据
     */
    const list = computed(() => store.state.menuList)  //用这个来代替前面被注释的那部分list
    
    /**
     * 计算属性：过滤出没有子菜单的菜单项
     * 用于直接渲染为el-menu-item
     */
    const noChildren = computed(() => list.value.filter(item => !item.children))
    
    /**
     * 计算属性：过滤出有子菜单的菜单项
     * 用于渲染为el-sub-menu
     */
    const hasChildren = computed(() => list.value.filter(item => item.children))
    
    /**
     * 计算属性：获取菜单折叠状态
     * 从全局状态管理中获取
     */
    const isCollapse = computed(() => { 
        return store.state.isCollapse
    })
    
    // 获取路由实例
    const route = useRoute()
    const router = useRouter()
    
    /**
     * 计算属性：根据折叠状态动态计算侧边栏宽度
     * 折叠时为64px，展开时为180px
     */
    const width = computed(() => {
        return store.state.isCollapse ? '64px' : '180px'
    })
    
    /**
     * 处理菜单点击事件
     * @param {Object} item - 被点击的菜单项对象
     * 1. 路由跳转到对应页面
     * 2. 更新全局状态中的当前选中菜单
     */
    const handleMenu = (item) => {
        router.push(item.path)
        store.selectMenu(item)
    }
    
    /**
     * 计算属性：获取当前活动菜单的路径
     * 用于设置菜单的default-active属性，高亮当前路由对应的菜单项
     */
    const activeMenu = computed(() => route.path)  
</script>

<!-- css区域 -->
<style lang="less" scoped>
/* 图标样式 */
.icons {
    width: 18px;
    height: 18px;
}

/* 菜单样式 */
.el-menu {
    line-height: 48px;
    color: #fff;
    text-align: center;
}

/* 侧边栏容器样式 */
.el-aside {
    height: 100%;
    background-color: #545c64;
}
</style>
