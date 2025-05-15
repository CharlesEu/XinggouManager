// import { mock } from "mockjs"
import request from "./request"

//请求首页左侧的表格的数据

export default{
  // 请求首页左侧表格的数据。
    getTableData(){
        return request({
            url:'/home/getTableData',
            method:'get', 
        })  
    },
    // 请求首页统计数据（例如用户数、访问量等）。
    getCountData(){
        return request({
            url:'/home/getCountData',
            method:'get',
           
        })
        
    },
    //定义请求方法，拿到图标数据
    getChartData() {
        return request({
          url: '/home/getChartData',
          method: 'get',
        })
      },
    getUserData(data) {
        return request({
          url: '/home/getUserData',
          method: 'get',
          data,
        })
      },
      // 用户删除 创建请求方法
    deleteUser(data) {
        return request({
          url: '/user/deleteUser',
          method: 'get',
          data
        })
      },
      //增加用户
    addUser(data) {
        return request({
          url: '/user/addUser',
          method: 'post',
          data
        })
      },
      //编辑用户
    editUser(data) {
        return request({
          url: '/user/editUser',
          method: 'post',
          data
        })
      },
      // 登陆界面
    getMenu(params) {
        return request({
          url: '/permission/getMenu',
          method: 'post',
          data: params
        })
    },
}