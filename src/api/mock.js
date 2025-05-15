import Mock from 'mockjs'
import homeApi from './mockData/home'
import userApi from './mockData/user'
import menuApi from './mockData/permission'
//1.拦截路径 2.方法 3.制造假数据
// 使用 Mock.js 拦截 API 请求
Mock.mock(/\/api\/home\/getTableData/, 'get', homeApi.getTableData)
Mock.mock(/\/api\/home\/getCountData/, 'get', homeApi.getCountData)
Mock.mock(/\/api\/home\/getChartData/,"get", homeApi.getChartData)
Mock.mock(/\/api\/home\/getUserData/,"get",userApi.getUserList)
Mock.mock(/\/api\/user\/deleteUser/, "get", userApi.deleteUser)
Mock.mock(/\/api\/user\/addUser/, "post", userApi.createUser)//显示蓝色就是没有调用到函数
// 记住了promise请求失败 大概率就API和mock这里出现了问题 因为我也没有请求后端 看看有没有字母写错了
Mock.mock(/\/api\/user\/editUser/, "post", userApi.updateUser)//字母不要敲错了，看仔细了edit都写错了 
Mock.mock(/\/api\/permission\/getMenu/, "post", menuApi.getMenu)//这次permission拼写错误







