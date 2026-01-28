<script setup lang="ts">
import { ref } from 'vue';
import * as langs from 'element-plus/es/locales'
import NumberRangePicker from './components/NumberRangePicker.vue'

const date = ref()
const lang = ref("")
const numberMax = ref<number>()
const numberMin = ref<number>()
const getLang = (l: string | undefined) => {
  return langs[l as keyof typeof langs];
}
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <!-- <el-select v-model="lang" placeholder="选择语言">
    <el-option v-for="item in Object.keys(langs)" :key="item" :label="getLang(item)?.name" :value="item" />
  </el-select> -->
  <!-- <el-config-provider :locale="getLang(lang)"> -->
    <div>
      <!-- <el-date-picker v-model="date" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" clearable  range-separator="至"  /> -->
      <br>
      <!-- {{ date }} -->
    </div>
    <div>
      <NumberRangePicker v-model:min="numberMin" v-model:max="numberMax" clearable shortcuts-type="tag" unit="元" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" :shortcuts="[
        { min: 0, max: 10 },
        { min: 10, max: 20 },
        { min: 20, max: 30 },
        { min: 30, max: 40 },
        { min: 40, max: 50 },
        { min: 50, max: 60 },
        { min: 60, max: 70 },
        { min: 70, max: 80 },
        { min: 80, max: 90 },
        { min: 90, max: 100 },
      ]"  /><br>
      <NumberRangePicker v-model:min="numberMin" v-model:max="numberMax" clearable size="small" :shortcuts="[
        { min: 0, max: 10 },
        { min: 10, max: 20 },
        { min: 20, max: 30 },
        { min: 30, max: 40 },
        { min: 40, max: 50 },
        { min: 50, max: 60 },
        { min: 60, max: 70 },
        { min: 70, max: 80 },
        { min: 80, max: 90 },
        { min: 90, max: 100 },
      ]" /><br>
    </div>
  <!-- </el-config-provider> -->
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
