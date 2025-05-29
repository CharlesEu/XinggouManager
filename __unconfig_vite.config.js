
let __unconfig_data;
let __unconfig_stub = function (data = {}) { __unconfig_data = data };
__unconfig_stub.default = (data = {}) => { __unconfig_data = data };
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
//这个是resolve别名
const __unconfig_default =  defineConfig({
  plugins: [vue()],
  //这个resolve是添加的别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
if (typeof __unconfig_default === "function") __unconfig_default(...[{"command":"serve","mode":"development"}]);export default __unconfig_data;