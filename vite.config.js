import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
//这个是resolve别名
export default defineConfig({
  plugins: [vue()],
  //这个resolve是添加的别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})