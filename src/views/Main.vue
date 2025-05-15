<!-- `Main.vue` 是后台管理系统的主布局组件，主要作用和设计原因如下：
1. 整体布局容器：
   - 提供整个后台管理系统的框架结构（左侧菜单+右侧内容区）
   - 使用 Element Plus 的 `el-container` 系列组件构建布局

2. 组件整合中心：
   - 集中管理三大核心组件：
     - `<CommonAside>`：左侧导航菜单
     - `<CommonHeader>`：顶部导航栏
     - `<CommonTab>`：标签页导航

3. 路由视图容器：
   - 通过 `<router-view>` 显示业务页面内容（如用户管理、商品管理等）

### 为什么组件都集中到这里
1. 布局一致性：
   - 保证所有业务页面共享相同的布局结构
   - 避免在每个页面重复编写布局代码

2. 状态管理便利：
   - 作为父组件可以统一管理子组件间的通信
   - 方便实现组件联动（如菜单折叠状态同步）

3. 路由控制中心：
   - 作为路由出口的父容器，控制内容区域的显示
   - 保持导航部分固定不变，只更新内容区域

4. 样式隔离：
   - 通过 scoped CSS 管理布局特有样式
   - 防止样式污染业务页面

这种设计模式是后台管理系统的典型做法，通过布局组件与业务组件分离，提高代码的可维护性和复用性。 -->

<template>
    <!-- 整体布局容器 - 最外层div，包含整个后台管理系统界面 -->
    <div class="common-layout">
        <!-- Element Plus的容器组件 - 用于创建后台管理系统的基础布局结构 -->
        <el-container class="lay-container">
              <!-- 左侧导航栏 - 引入CommonAside组件，显示系统菜单 -->
                <CommonAside/>

            <!-- 右侧内容区容器 - 包含头部、标签页和主内容区 -->
            <el-container>
                <!-- 顶部导航栏 - 使用Element Plus的header组件 -->
                <el-header class="el-header">
                    <!-- 引入CommonHeader组件，显示顶部导航内容（如面包屑、用户信息等） -->
                    <CommonHeader/>
                </el-header>

                <!-- 标签页导航 - 引入CommonTab组件，显示已打开页面的标签导航 -->
                <CommonTab/>

                <!-- 主要内容区域 - 使用Element Plus的main组件作为内容显示区 -->
                <el-main class="right-main">                   
                    <!-- 路由视图 - 根据当前路由动态显示对应的页面组件（如Home、User、Mall等） -->
                    <router-view></router-view>
                </el-main>

            </el-container>

        </el-container>
    </div>
</template>
    
<script setup>
import CommonAside from '@/components/CommonAside.vue'
import CommonHeader from '@/components/CommonHeader.vue'
import CommonTab from '@/components/CommonTab.vue'

</script>
    
<style lang="less" scoped >
    .common-layout,.lay-container{
        height: 100%;

    }
    .el-header{
        background-color: #333;
    }
</style>

<!-- 实际上， App.vue 和 Main.vue 虽然都是“父组件”，但它们的定位和作用是不同的：

 1. App.vue 的作用
- 全局根组件 ：整个 Vue 应用的入口，所有内容都挂载在这里。
- 全局布局/全局样式 ：可以在这里放置全局的样式、全局的 loading、全局弹窗等。
- 路由出口 ：通常只包含一个 <router-view /> ，让路由决定显示哪个页面。
2. Main.vue 的作用
- 后台主框架组件 ：只负责后台管理系统的主界面布局（如左侧菜单、顶部栏、标签页、内容区）。
- 业务页面的父容器 ：只有在登录后、进入后台主界面时才会用到。
- 不是所有页面都用 ：比如登录页、404页等都不会用到 Main.vue 的布局。
 3. 关系举例
- App.vue 是整个应用的“总管家”，所有页面都在它下面。
- Main.vue 只是后台主界面的“二级管家”，只有后台相关页面才会用到它。
路由结构一般如下：

App.vue
 └── router-view
      ├── Login.vue
      ├── 404.vue
      └── Main.vue
           ├── Home.vue
           ├── User.vue
           └── Mall.vue
           └── Finance.vue

## 总结
- App.vue 是全局唯一的根组件，负责整个应用的入口和全局内容。
- Main.vue 是后台主界面的布局容器，只在需要后台布局时出现。
- 两者的作用范围和职责不同，不是重复的。
如果你打开登录页、404页，通常不会看到 Main.vue 的布局；只有进入后台主界面（比如 /home、/user 等）时，Main.vue 才会作为父组件出现。 -->