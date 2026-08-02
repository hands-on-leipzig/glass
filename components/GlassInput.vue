<script setup>
import {computed} from 'vue'

defineOptions({inheritAttrs: false})

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  accent: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'glass-input--sm'
  if (props.size === 'lg') return 'glass-input--lg'
  return ''
})
</script>

<template>
  <textarea
    v-if="type === 'textarea'"
    class="glass-input liquid-surface-control"
    :class="[
      sizeClass,
      accent && 'liquid-surface-control--accent-blue',
      invalid && 'liquid-surface-control--invalid',
    ]"
    :value="modelValue ?? ''"
    :disabled="disabled"
    v-bind="$attrs"
    @input="emit('update:modelValue', $event.target.value)"
  />
  <input
    v-else
    class="glass-input liquid-surface-control"
    :class="[
      sizeClass,
      accent && 'liquid-surface-control--accent-blue',
      invalid && 'liquid-surface-control--invalid',
    ]"
    :type="type"
    :value="modelValue ?? ''"
    :disabled="disabled"
    v-bind="$attrs"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
