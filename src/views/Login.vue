
<!-- 登陆页面 -->
 <!-- HTML 骨架搭建 -->
<template>
  <!-- 登录页面最外层容器 - 设置全屏背景图 -->
  <div class="body-login">
    <!-- 登录卡片容器 - 包含左侧标题区和右侧表单区 -->
    <div class="login-wrapper">
      <!-- 左侧区域 - 显示系统标题和副标题 -->
      <div class="login-left">
        <div class="system-title">
          <h1>星购管理平台</h1>
          <p>Xinggou Management Platform</p>
        </div>
      </div>
      
      <!-- 右侧登录表单区域 - 使用Element Plus表单组件 -->
      <el-form :model="loginForm" class="login-container">
        <!-- 表单头部 - 包含logo图标和欢迎文字 -->
        <div class="login-header">
          <!-- Logo区域 - 显示钥匙图标 -->
          <div class="logo">
            <el-icon class="logo-icon"><Key /></el-icon>
          </div>
          <!-- 欢迎标题和提示文字 -->
          <h2>欢迎登录</h2>
          <p>请输入您的账号和密码</p>
        </div>
        
        <!-- 用户名输入框 - 带有用户图标和清空按钮 -->
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号" 
            :prefix-icon="User"
            clearable
          ></el-input>
        </el-form-item>
        
        <!-- 密码输入框 - 带有锁图标和显示密码按钮 -->
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <!-- 登录按钮 - 点击触发handlelogin方法，支持加载状态 -->
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handlelogin" 
            :loading="loading"
            class="login-button"
          >登录系统</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<!-- js 函数定义 -->
<script setup>
import { reactive, getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAllDataStore } from '../stores'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()
const store = useAllDataStore()
const router = useRouter()
const loginForm = reactive({
  username: 'admin',
  password: 'admin',
})
const loading = ref(false)

const handlelogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  
  loading.value = true
  try {
    const res = await proxy.$api.getMenu(loginForm)
    //拿到菜单之后，在哪里显示
    store.updateMenuList(res.menuList)
    store.state.token = res.token
    if (res) {
      ElMessage.success('登录成功')
      store.addMenu(router)
      router.push("/home")
      // 注意这两个的顺序，先添加路由，再跳转，否则会找不到/home的路由
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查账号密码')
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>



<!--CSS 样式渲染  -->
<style lang="less" scoped>
.body-login {
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/background.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.login-wrapper {
  display: flex;
  width: 900px;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
  
  .system-title {
    text-align: center;
    
    h1 {
      font-size: 32px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    p {
      font-size: 16px;
      opacity: 0.8;
    }
  }
}

.login-container {
  width: 400px;
  background-color: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      background-color: #1976d2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .logo-icon {
        font-size: 30px;
        color: white;
      }
    }
    
    h2 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 10px;
    }
    
    p {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .el-form-item {
    margin-bottom: 25px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    
    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #1976d2 inset;
    }
  }
  
  .login-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
    background-color: #1976d2;
    border: none;
    
    &:hover {
      background-color: #1565c0;
    }
  }
}

// 添加响应式设计
@media screen and (max-width: 900px) {
  .login-wrapper {
    width: 90%;
    flex-direction: column;
    height: auto;
  }
  
  .login-left {
    padding: 30px;
  }
  
  .login-container {
    width: 100%;
  }
}
</style>