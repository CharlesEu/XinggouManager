// 创建拦截方法 登陆界面
import Mock from 'mockjs'
export default {
  getMenu: config => {
    const { username, password } = JSON.parse(config.body)
    // 先判断用户是否存在
    // 判断账号和密码是否对应
    //menuList用于后面做权限分配，也就是用户可以展示的菜单
    if (username === 'admin' && password === 'admin') {
      return {
        code: 200,
        data: {
          menuList: [
            {
              path: '/home',
              name: 'home',
              label: '首页',
              icon: 'house',
              url: 'Home'
            },
            {
              path: '/mall',
              name: 'mall',
              label: '商品管理',
              icon: 'video-play',
              url: 'Mall'
            },
            {
              path: '/user',
              name: 'user',
              label: '用户管理',
              icon: 'user',
              url: 'User'
            },
            {
              path: '/finance-management',
              name: 'finance-management',
              label: '财务管理',
              icon: 'location',
              children: [
                {
                  path: '/finance',
                  name: 'finance',
                  label: '财务报表分析',
                  icon: 'setting',
                  url: 'Finance'
                },
                {
                  path: '/budget',
                  name: 'budget',
                  label: '预算管理',
                  icon: 'setting',
                  url: 'Budget'
                }
              ]
            }
          ],
          token: Mock.Random.guid(),
          message: '获取成功'
        }
      }
    } else if (username === 'xiaoxiao' && password === 'xiaoxiao') {
      return {
        code: 200,
        data: {
          menuList: [
            {
              path: '/home',
              name: 'home',
              label: '首页',
              icon: 'house',
              url: 'Home'
            },
            {
              path: '/user',
              name: 'user',
              label: '用户管理',
              icon: 'user',
              url: 'User'
            }
          ],
          token: Mock.Random.guid(),
          message: '获取成功'
        }
      }
    } else {

      return {
        code: -999,
        data: {
          message: '密码错误'
        }
      }

    }

  }
}