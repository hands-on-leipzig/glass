<script setup>
import { computed } from 'vue'
import { splitFllBrand } from '../brand/index.js'

const props = defineProps({
  text: { type: String, default: '' },
})

const parts = computed(() => splitFllBrand(props.text))
</script>

<template>
  <template v-for="(part, i) in parts" :key="i"><i v-if="part.italic">{{ part.text }}</i><template v-else>{{ part.text }}</template></template>
</template>
