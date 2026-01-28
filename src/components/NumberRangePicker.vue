<script setup lang="ts">
import { type Component, computed, reactive, watch } from 'vue';
import { type ButtonProps, ElButton, ElTag, type TagProps } from 'element-plus';
// import 'element-plus/es/components/base/style/css';
// import "element-plus/es/components/date-picker/style/css"
/**
 * 数字区间选择器组件
 * @description 支持自定义快捷选项、范围限制、单位、尺寸等配置的数字区间选择器
 * @props {boolean} clearable - 是否显示清空按钮
 * @props {string} startPlaceholder - 最小值输入框占位符
 * @props {string} endPlaceholder - 最大值输入框占位符
 * @props {string} rangeSeparator - 区间分隔符
 * @props {RangeShortcut[]} shortcuts - 快捷选项列表（支持函数返回）
 * @props {ShortcutsType} shortcutsType - 快捷选项展示类型（button/tag/buttonList/tagList）
 * @props {string} unit - 数值单位（如元、件）
 * @props {number} minRange - 最小值限制
 * @props {number} maxRange - 最大值限制
 * @props {string | number} panelWidth - 弹窗宽度
 * @emits {change} - 值变化时触发，返回 { min: number | undefined, max: number | undefined }
 */
defineOptions({
  name: 'NumberRangePicker'
});
interface RangeShortcut {
  min?: number;
  max?: number;
  unit?: string;
  prefix?: string;
  bind?: Partial<ButtonProps> | Partial<Omit<TagProps, 'closable' | 'disableTransitions'>>;
  format?: (shortcut: Readonly<RangeShortcut>) => string;
}
type ShortcutsType = 'button' | 'tag' | 'buttonList' | 'tagList';

interface Props {
  clearable?: boolean;
  startPlaceholder?: string;
  endPlaceholder?: string;
  rangeSeparator?: string;
  shortcuts?: Array<RangeShortcut | (() => RangeShortcut)>;
  shortcutsRangeSeparator?: string;
  shortcutsType?: ShortcutsType;
  shortcutsTitle?: string;
  numberTitle?: string;
  shortcutsBind?: Partial<ButtonProps> | Partial<Omit<TagProps, 'closable' | 'disableTransitions'>>;
  unit?: string;
  readonly?: boolean;
  disabled?: boolean;
  size?: 'large' | 'default' | 'small';
  editable?: boolean;
  showConfirm?: boolean;
  showFooter?: boolean;
  confirmButtonText?: string;
  clearButtonText?: string;
  clearIcon?: Component | string;
  prefixIcon?: Component | string;
  minRange?: number | undefined;
  maxRange?: number | undefined;
  autoCloseAfterShortcuts?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  startPlaceholder: undefined,
  endPlaceholder: undefined,
  rangeSeparator: '-',
  shortcutsRangeSeparator: undefined,
  shortcutsType: 'button',
  shortcutsTitle: '快捷选择',
  numberTitle: '请输入范围',
  shortcutsBind: undefined,
  shortcuts: () => [],
  unit: '',
  readonly: false,
  disabled: false,
  size: undefined,
  editable: true,
  showConfirm: true,
  showFooter: true,
  confirmButtonText: '确定',
  clearButtonText: '清空',
  clearIcon: undefined,
  prefixIcon: undefined,
  minRange: undefined,
  maxRange: undefined,
  autoCloseAfterShortcuts: true
});

const emit = defineEmits<{
  (e: 'change', min: number | undefined, max: number | undefined): void;
}>();

const validateRange = (min: number | undefined, max: number | undefined) => {
  if (min === undefined || max === undefined) return { min, max };
  if (min > max) {
    // 方案1：交换值；方案2：清空max；根据业务选择，这里选交换
    return { min: max, max: min };
    // 方案2：return { min, max: undefined };
  }
  return { min, max };
};

const getValueByRange = (v: number | undefined) => {
  if (v === undefined || v === null || Number.isNaN(v as number)) return undefined;
  const num = Number(v);
  if (props.minRange !== undefined && num < props.minRange) {
    return props.minRange;
  }
  if (props.maxRange !== undefined && num > props.maxRange) {
    return props.maxRange;
  }
  return num;
};
const modelMin = defineModel<number | undefined>('min', {
  required: false,
  default: undefined,
  set(v) {
    return getValueByRange(v);
  }
});
const modelMax = defineModel<number | undefined>('max', {
  required: false,
  default: undefined,
  set(v) {
    return getValueByRange(v);
  }
});

// type
// unlink-panels
// validate-event
// automatic-dropdown 2.11.4

const state = reactive({
  popoverVisible: false
});

const selectRange = (range: RangeShortcut) => {
  const min = getValueByRange(range.min);
  const max = getValueByRange(range.max);
  const { min: validMin, max: validMax } = validateRange(min, max);
  modelMin.value = validMin;
  modelMax.value = validMax;
  // 可选：点击快捷选项后自动关闭弹窗（可配置）
  if (props.autoCloseAfterShortcuts) {
    state.popoverVisible = false;
  }
};

const resetRange = () => {
  modelMin.value = undefined;
  modelMax.value = undefined;
};

const getShortcuts = (shortcuts: Array<RangeShortcut | (() => RangeShortcut)>) => {
  return shortcuts?.map(item => {
    if (typeof item === 'function') {
      return item();
    }
    return item;
  });
};
const shortcutsComputed = computed(() => {
  return getShortcuts(props.shortcuts)
    .filter(r => r.min !== undefined || r.max !== undefined)
    .filter(
      r =>
        (r.min === undefined || props.minRange === undefined || r.min >= props.minRange) &&
        (r.max === undefined || props.maxRange === undefined || r.max <= props.maxRange)
    );
});

watch(
  [modelMin, modelMax],
  ([newMin, newMax], [oldMin, oldMax]) => {
    // 1. 校验 min > max
    const { min, max } = validateRange(newMin, newMax);
    if (min !== newMin || max !== newMax) {
      modelMin.value = min;
      modelMax.value = max;
      return;
    }

    // 2. 派发 change 事件（仅值真的变化时）
    if (min !== oldMin || max !== oldMax) {
      emit('change', min, max);
      // // 同步更新整体 modelValue
      // modelValue.value = { min, max };
    }
  },
  { immediate: true }
);
</script>

<template>
  <ElPopover
    v-model:visible="state.popoverVisible"
    :disabled="props.readonly || props.disabled"
    trigger="click"
    width=""
    popper-style="padding: 0"
  >
    <div class="el-picker-panel number-range-picker">
      <div class="number-range-picker-panel__body">
        <div class="number-input-group">
          <label class="number-title">{{ props.numberTitle }}</label>
          <ElSpace>
            <ElInput v-model.number="modelMin" :placeholder="props.startPlaceholder" type="number" clearable />
            <span class="range-separator">{{ props.rangeSeparator }}</span>
            <ElInput v-model.number="modelMax" :placeholder="props.endPlaceholder" type="number" clearable />
            <span v-if="props.unit" class="number-unit">{{ props.unit }}</span>
          </ElSpace>
        </div>
        <div v-if="shortcutsComputed?.length">
          <div class="number-title">{{ props.shortcutsTitle }}</div>
          <ElSpace wrap :fill="['buttonList', 'tagList'].includes(props.shortcutsType)" class="preset-range-list">
            <component
              :is="['tag', 'tagList'].includes(props.shortcutsType) ? ElTag : ElButton"
              v-for="(range, index) in shortcutsComputed"
              :key="index"
              v-bind="range.bind ?? props.shortcutsBind"
              @click="selectRange(range)"
            >
              <template v-if="range.format">{{ range.format(range) }}</template>
              <template v-else>
                {{ range.prefix }} {{ range.min }} {{ props.shortcutsRangeSeparator ?? props.rangeSeparator }}
                {{ range.max }} {{ range.unit ?? props.unit }}
              </template>
            </component>
          </ElSpace>
        </div>
      </div>
      <div v-if="props.showFooter" class="el-picker-panel__footer">
        <ElButton size="small" text @click="resetRange">{{ props.clearButtonText }}</ElButton>
        <ElButton v-if="props.showConfirm" size="small" plain @click="state.popoverVisible = false">
          {{ props.confirmButtonText }}
        </ElButton>
      </div>
    </div>
    <template #reference>
      <div
        class="number-range-editor-picker el-input__wrapper el-range-editor el-tooltip__trigger el-tooltip__trigger"
        :class="{
          'is-active': state.popoverVisible,
          'is-disabled': props.disabled,
          'el-range-editor--small': props.size === 'small',
          'el-range-editor--large': props.size === 'large'
        }"
      >
        <ElIcon class="el-range__icon">
          <component :is="props.prefixIcon" v-if="props.prefixIcon" />
          <i-heroicons-currency-yen v-else />
          <!-- <icon-mingcute-currency-cny-line /> -->
          <!-- <icon-heroicons-currency-yen /> -->
          <!-- <icon-material-symbols-currency-yen-rounded/> -->
        </ElIcon>
        <input
          v-model.number="modelMin"
          type="number"
          tabindex="0"
          autocomplete="off"
          class="el-range-input"
          :placeholder="props.startPlaceholder"
          :readonly="props.readonly || props.disabled || !props.editable"
        />
        <span class="el-range-separator">{{ props.rangeSeparator }}</span>
        <input
          v-model.number="modelMax"
          type="number"
          tabindex="0"
          autocomplete="off"
          class="el-range-input"
          :placeholder="props.endPlaceholder"
          :readonly="props.readonly || props.disabled || !props.editable"
        />
        <span v-if="props.unit" class="unit-text">{{ props.unit }}</span>
        <ElIcon
          v-if="props.clearable"
          class="el-range__close-icon"
          :class="{ 'el-range__close-icon--hidden': !(modelMin || modelMax) }"
          @click.stop="resetRange"
        >
          <component :is="props.clearIcon" v-if="props.clearIcon" />
          <i-ep-circle-close v-else />
        </ElIcon>
      </div>
    </template>
  </ElPopover>
</template>

<style scoped>
/* 整体容器 */
.number-range-editor-picker {
  /* --el-date-editor-width: 220px;
  --el-date-editor-monthrange-width: 300px;
  --el-date-editor-daterange-width: 350px;
  --el-date-editor-datetimerange-width: 400px; */
  --el-datepicker-bg-color: var(--el-bg-color-overlay);
  --el-input-text-color: var(--el-text-color-regular);
  --el-input-border: var(--el-border);
  --el-input-hover-border: var(--el-border-color-hover);
  --el-input-focus-border: var(--el-color-primary);
  --el-input-transparent-border: 0 0 0 1px transparent inset;
  --el-input-border-color: var(--el-border-color);
  --el-input-border-radius: var(--el-border-radius-base);
  --el-input-bg-color: var(--el-fill-color-blank);
  --el-input-icon-color: var(--el-text-color-placeholder);
  --el-input-placeholder-color: var(--el-text-color-placeholder);
  --el-input-hover-border-color: var(--el-border-color-hover);
  --el-input-clear-hover-color: var(--el-text-color-secondary);
  --el-input-focus-border-color: var(--el-color-primary);
  --el-input-width: 100%;
  /* position: relative;
  text-align: left;
  vertical-align: middle; */
}
/* .number-range-editor-picker.el-input__wrapper { */
    /* height: var(--el-input-height, var(--el-component-size)); */
    /* width: 400px; */
    /* width: var(--el-date-editor-width); */
    /* box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset; */
/* } */
.number-range-editor-picker .el-range__icon {
  color: var(--el-text-color-placeholder);
  float: left;
  font-size: 14px;
  height: inherit;
}
.number-range-editor-picker .el-range-input::placeholder {
  color: var(--el-input-placeholder-color);
}
.number-range-editor-picker .el-range-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  border: none;
  color: var(--el-text-color-regular);
  display: inline-block;
  font-size: var(--el-font-size-base);
  height: 30px;
  line-height: 30px;
  margin: 0;
  outline: none;
  padding: 0;
  text-align: center;
  /* width: 39%; */
  width: 100%;
}
.number-range-editor-picker:deep(input[type='number']::-webkit-inner-spin-button),
.number-range-editor-picker:deep(input[type='number']::-webkit-outer-spin-button),
.number-input-group:deep(input[type='number']::-webkit-inner-spin-button),
.number-input-group:deep(input[type='number']::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
.number-range-editor-picker .el-range-separator {
  align-items: center;
  color: var(--el-text-color-primary);
  display: inline-flex;
  flex: 1;
  font-size: 14px;
  height: 100%;
  justify-content: center;
  margin: 0;
  overflow-wrap: break-word;
  padding: 0 5px;
}
.number-range-editor-picker .el-range__close-icon {
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 14px;
  height: inherit;
  width: unset;
  opacity: 0;
  visibility: hidden;
}
.number-range-editor-picker:not(.is-disabled):hover .el-range__close-icon:not(.el-range__close-icon--hidden),
.number-range-editor-picker.is-active .el-range__close-icon:not(.el-range__close-icon--hidden) {
  opacity: 1;
  visibility: visible;
}

.number-range-picker {
  --el-datepicker-inner-border-color: var(--el-border-color-light);
  width: 360px;
}
.number-range-picker-panel__body {
  margin: 12px;
}

.unit-text {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  margin-right: 4px;
}

.range-separator {
  color: var(--el-text-color-placeholder);
  /* font-size: 14px; */
  margin: 0 4px;
  /* white-space: nowrap; */
}

.number-input-group {
  margin-bottom: 12px;
}

.number-title {
  /* font-size: 14px; */
  /* color: var(--el-text-color-primary); */
  margin-bottom: 6px;
  display: block;
}

.number-unit {
  color: var(--el-text-color-placeholder);
  /* font-size: 14px; */
  margin-left: 4px;
}
.preset-range-list .el-tag {
  cursor: pointer;
}
</style>
<!-- 
.el-picker-panel__footer {
    background-color: var(--el-datepicker-bg-color);
    border-top: 1px solid var(--el-datepicker-inner-border-color);
    font-size: 0;
    padding: 4px 12px;
    position: relative;
    text-align: right;
}
用户代理样式表
div {
    display: block;
}
<style>
.el-date-range-picker {
    --el-datepicker-text-color: var(--el-text-color-regular);
    --el-datepicker-off-text-color: var(--el-text-color-placeholder);
    --el-datepicker-header-text-color: var(--el-text-color-regular);
    --el-datepicker-icon-color: var(--el-text-color-primary);
    --el-datepicker-border-color: var(--el-disabled-border-color);
    --el-datepicker-inner-border-color: var(--el-border-color-light);
    --el-datepicker-inrange-bg-color: var(--el-border-color-extra-light);
    --el-datepicker-inrange-hover-bg-color: var(--el-border-color-extra-light);
    --el-datepicker-active-color: var(--el-color-primary);
    --el-datepicker-hover-text-color: var(--el-color-primary);
    --el-datepicker-bg-color: var(--el-bg-color-overlay);
    width: 646px;
}
<style>
.el-picker-panel {
    background: var(--el-datepicker-bg-color);
    border-radius: var(--el-popper-border-radius, var(--el-border-radius-base));
    color: var(--el-text-color-regular);
    line-height: 30px;
}
<style>
.el-popper.is-light {
    --el-fill-color-blank: var(--el-popper-bg-color-light);
}
<style>
.el-picker__popper {
    --el-datepicker-border-color: var(--el-disabled-border-color);
}
<style>
.el-popper {
    --el-popper-border-radius: var(--el-popover-border-radius, 4px);
    --el-popper-bg-color-light: var(--el-bg-color-overlay);
    --el-popper-bg-color-dark: var(--el-text-color-primary);
    border-radius: var(--el-popper-border-radius);
    font-size: 12px;
    line-height: 20px;
    min-width: 10px;
    overflow-wrap: break-word;
    padding: 5px 11px;
    position: absolute;
    visibility: visible;
    word-break: normal;
    z-index: 2000;
}
-->