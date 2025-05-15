// 这段代码是一个 Pinia Store，用于管理 Vue 3 应用的全局状态。共享的数据

import { defineStore } from 'pinia'
import { ref ,watch} from 'vue'

//初始化state数据，这里我们使用一个函数来返回
function initState(){
  return {
   isCollapse:false,  // 侧边栏是否折叠
   tags:[
         {
           path:'/home',
           name:'home',
           label:'首页',
           icon:'home'
          }
        ],// 已打开的标签页
        currentMenu: null,   // 当前选中的菜单项
        menuList: [],        // 从后端获取的菜单数据
        token: '',           // 用户认证 Token
        routerList: []       // 动态添加的路由
  }
}

//第一个参数要求是一个独一无二的名字
//第二个参数可接受两类值：Setup 函数或 Option 对象。
export const useAllDataStore = defineStore('allData', () => {
         //在 Setup Store 中：
      //ref() 就是 state 属性
      //computed() 就是 getters
      //function() 就是 actions    
      const state=ref(initState())

      watch(state,
        (newObj)=>{
        if(!newObj.token) {return}
        localStorage.setItem('store',JSON.stringify(newObj))
      },
      {deep:true}
    )

      function selectMenu(val){
        if(val.name==='home'){
          state.value.currentMenu=null
        }
        else{
          state.value.currentMenu=val
          let index=state.value.tags.findIndex(item=>item.name===val.name)
          index===-1?state.value.tags.push(val):''
        }
      }

      function updateTags(tag){
        let index=state.value.tags.findIndex((item)=>item.name===tag.name)
        state.value.tags.splice(index,1)
      }

      function updateMenuList(val){
        state.value.menuList=val
      }
      //动态路由
      function addMenu(router,type){
        if(type==='refresh'){
          // 如果 type 为 'refresh'，表示刷新时需要从 localStorage 恢复状态
          if(JSON.parse(localStorage.getItem('store'))){
            state.value=JSON.parse(localStorage.getItem('store'))
            state.value.routerList=[]  // 清空 routerList，确保重新加载路由
          }
          else{
            return // 如果 localStorage 没有数据，直接返回
          }
        }
        const menu=state.value.menuList  // 获取菜单数据
        const module=import.meta.glob('../views/**/*.vue') // 通过 Vite 动态导入所有 Vue 组件
        const routeArr=[] // 存储解析后的路由
        // 遍历菜单数据
        menu.forEach((item)=>{
          //如果当前菜单项有子菜单
          if(item.children){
            item.children.forEach((val)=>{
              let url = `../views/${val.url}.vue`; // 构造组件路径
              // 检查组件是否存在
              if (module[url]) {
                 val.component = module[url]; // 赋值组件
                 routeArr.push(val); // 修改这里：将处理好的子菜单项 val 加入路由数组
              } else {
                 console.error(`组件不存在: ${url}`);
              }
            })
          }
          else{
            let url =`../views/${item.url}.vue`
            // 检查组件是否存在
            if (module[url]) {
              item.component=module[url]
              routeArr.push(item)
            } else {
              console.error(`组件不存在: ${url}`);
            }
          }
        })
        // 清空路由列表，准备重新添加
        state.value.routerList=[]

         // 删除已存在的动态路由
        let routers=router.getRoutes()
        routers.forEach(item=>{
          if(item.name=='main'||item.name=='login'||item.name=='404'){
            return
          }
          else{
            router.removeRoute(item.name)
          }
        })

        // 添加新的动态路由
        routeArr.forEach(item=>{
          // 检查路由是否已存在，避免重复添加 (可选优化)
          if (!router.hasRoute(item.name)) {
             console.log(`添加路由: ${item.path}, 名称: ${item.name}, 组件: ${item.url}`);
             const removeRouteCallback = router.addRoute('main', item);
             state.value.routerList.push(removeRouteCallback); // 保存移除路由的回调
          } else {
             console.warn(`路由 "${item.name}" (${item.path}) 已存在，跳过添加。`);
          }
        })
      }
      function clean(){
        state.value.routerList.forEach((item)=>{
          if(item) item()
        })
        state.value=initState()
        //删除我们本地的缓存
        localStorage.removeItem('store')
      }
      //需要把所有定义的state，getters，actions返回出去
      return {
        state,
        selectMenu,
        updateTags,
        updateMenuList,
        addMenu,
        clean

      }
})