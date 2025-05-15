//引入两个方法，第一个创建路由器对象，第二个是开启hash模式的方法
import { createRouter, createWebHashHistory } from 'vue-router'

//路由规则
const routes = [
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/Main.vue'),
      redirect:'/home',
      children:[ 
        //这些都是main的子路由
        //主页
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/Home.vue')
        },
        //用户管理
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/User.vue')
        },

        //商品管理
        {
          path: 'mall',
          name: 'mall',
          component: () => import('@/views/Mall.vue')
        },
        // 财务分析报表
        {
          path: '/finance',
          name: 'finance',
          component: () => import('@/views/Finance.vue')
        },
        // 预算管理
        {
          path: '/budget',
          name: 'budget',
          component: () => import('@/views/Budget.vue')
        },
      ],
    },
    // 登陆界面
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    // 404页面
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/404.vue')
    },
    

    
  ]

const router = createRouter({
    //history设置路由模式
    history: createWebHashHistory(),
    routes
})



//把路由器暴露出去
export default  router