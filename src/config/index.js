/**
 * 环境配置文件
 * 一般在企业级项目里面有三个环境
 * 开发环境
 * 测试环境
 * 线上环境
 */


// 当前的环境
const env = import.meta.env.MODE || 'prod'

const EnvConfig = {
  // 开发环境
  development: {
    baseApi: '/api',
    mockApi: 'https://mock.apifox.cn/m1/4068509-0-default/api',
  },
  // 测试环境
  test: {
    baseApi: '//test.future.com/api',
    mockApi: 'https://mock.apifox.cn/m1/4068509-0-default/api',
  },
  // 线上环境
  prod: {
    baseApi: '//future.com/api',
    mockApi: 'https://mock.apifox.cn/m1/4068509-0-default/api',
  },
}

export default {
  env,
  mock:false,  //是否开启mock 总mock开关
  ...EnvConfig[env]
}