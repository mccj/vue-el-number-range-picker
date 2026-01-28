import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import Icons from "unplugin-icons/vite"
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver';
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  Components({
    resolvers: [ElementPlusResolver(), IconsResolver({})],
  }),
  Icons({
    autoInstall: true,
  }),
  vueDevTools()
  ],
})
