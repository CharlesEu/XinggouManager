<!-- `App.vue` 是 Vue 项目的根组件，主要作用包括：

1. **应用入口**：
   - 作为整个 Vue 应用的容器组件
   - 所有其他组件和页面都会在这里被渲染

2. **路由管理**：
   - 通过 `<router-view>` 标签显示当前路由对应的页面内容
   - 作为 Vue Router 的视图出口

3. **全局样式**：
   - 定义了应用的基本布局样式（全屏显示、隐藏滚动条等）
   - 这些样式会应用到整个应用

4. **公共组件**：
   - 可以放置需要全局显示的组件（如导航栏、页脚等）
   - 当前示例中包含了两个测试用的按钮

在您的代码中：
- `<router-view>` 是核心，负责根据路由动态渲染不同页面
- 样式设置了应用全屏显示且隐藏溢出内容
- 目前还包含两个测试用的 Element Plus 按钮

这个文件通常还会包含：
- 全局状态初始化
- 应用级别的配置
- 错误处理
- 全局事件监听等

它是整个 Vue 应用的"外壳"，所有其他内容都会在这个容器内渲染和展示。 -->
<!-- App.vue 是 Vue 3 项目的 根组件（Root Component），它是整个应用的入口点，负责渲染所有页面和组件。 -->
<script setup>


</script>

<template>
   <!-- Vue Router 视图出口 -->
  <router-view></router-view>
   
  

</template>

<script setup>
import { Refresh } from '@element-plus/icons-vue';
</script>

<!-- 这个是app的样式，设置全屏展示，防止滚动条的出现
注意，style上不要使用scoped -->
<style>
 /* 设置全屏布局，隐藏滚动条 */
  #app{
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  

</style>
