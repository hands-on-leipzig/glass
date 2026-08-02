<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  forId: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div
    class="glass-field"
    :class="{ 'glass-field--invalid': invalid || !!error }"
  >
    <label
      v-if="label"
      class="glass-field__label"
      :for="forId || undefined"
    >
      {{ label }}
      <span v-if="required" aria-hidden="true"> *</span>
    </label>

    <slot />

    <p v-if="error" class="glass-field__error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="glass-field__hint">
      {{ hint }}
    </p>
  </div>
</template>
