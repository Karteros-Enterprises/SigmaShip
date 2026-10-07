<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="section-heading">
    <div>
      <p
        v-if="eyebrow"
        class="eyebrow"
      >
        {{ eyebrow }}
      </p>

      <h2>{{ title }}</h2>

      <p
        v-if="description"
        class="section-description"
      >
        {{ description }}
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="section-actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
