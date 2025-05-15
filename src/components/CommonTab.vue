<!-- CommonTab 组件是一个标签页导航组件，主要用于实现后台管理系统中的多标签页功能 -->
<!-- 1. 核心功能 ：
   
   - 显示当前打开的页面标签（如首页、商品管理、用户管理等）
   - 允许通过点击标签快速切换页面
   - 支持关闭标签页（首页标签不可关闭）
2. 交互特性 ：
   
   - 当前路由对应的标签会高亮显示（dark效果）
   - 点击标签会跳转到对应页面
   - 可以关闭非首页的标签
3. 状态管理 ：
   
   - 与 Vuex/Pinia 状态管理集成，从 store 获取标签数据
   - 与路由系统联动，根据当前路由高亮对应标签
4. UI设计 ：
   
   - 使用 Element Plus 的 el-tag 组件实现
   - 提供统一的标签样式和间距
   - 位于页面顶部，通常与 CommonHeader 组件配合使用
这个组件通常位于页面顶部导航栏下方，为用户提供便捷的多页面切换功能，是后台管理系统中常见的导航模式之一。
 -->
<!-- html区域 -->
<template>
  <div class="tags">
      <!--closable是否有关闭按钮,hoem标签不能关闭所以为false
          effect主题，找到当前路由对应的tab，设置'dark'高亮主题
      -->
    <el-tag
      :key="tag.name"
      v-for="(tag, index) in tags"
      :closable="tag.name !== 'home'"
      :effect="route.name === tag.name ? 'dark' : 'plain'"
      @click="handleMenu(tag)"
      @close="handleClose(tag,index)"
      
    >
      {{ tag.label }}
    </el-tag>
  </div>
</template>

<!-- js区域 -->
<script setup>

import {ref,computed} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import { useAllDataStore } from '@/stores'


const store=useAllDataStore()
const route =useRoute()
const router =useRouter()

const tags=computed(()=>store.state.tags)
  
const changeMenu=(tag)=>{
    //单击tab时，联动面包屑
  store.selectMenu(tag)
    //跳转对应页面
  router.push(tag.name)
}

const handleMenu=(tag)=>{
  router.push(tag.name)
  store.selectMenu(tag)
}
//关闭tab时触发
const handleClose=(tag,index)=>{
  //pinia管理
  store.updateTags(tag)

  //如果点击的关闭的tag不是当前的页面
  if(tag.name!==route.name) return

  if(index===store.state.tags.length){
    store.selectMenu(tags.value[index-1])
    router.push(tags.value[index-1].name)
  }
  else{
    store.selectMenu(tags.value[index])
    router.push(tags.value[index].name)
  }


}

</script>

<!-- css区域 -->
<style lang="less" scoped>
.tags{
  margin: 20px 0 0 20px;
}
.el-tag{
  margin-right: 10px;
}
</style>
