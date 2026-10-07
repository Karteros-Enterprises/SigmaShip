<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Set up your workspace'
})

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const organizationName = ref('')
const organizationSlug = ref('')
const slugTouched = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

watch(organizationName, (name) => {
  if (slugTouched.value) {
    return
  }

  organizationSlug.value = slugify(name)
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function updateSlug(value: string) {
  slugTouched.value = true
  organizationSlug.value = slugify(value)
}

async function createWorkspace() {
  if (!user.value) {
    await navigateTo('/login')
    return
  }

  errorMessage.value = ''
  submitting.value = true

  const { error } = await supabase.rpc('create_organization', {
    organization_name: organizationName.value.trim(),
    organization_slug: organizationSlug.value
  })

  submitting.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  await navigateTo('/ship')
}
</script>

<template>
  <main class="onboarding-page">
    <section class="onboarding-shell">
      <header class="onboarding-header">
        <NuxtLink to="/" class="auth-brand">
          <span>Σ</span>
          SigmaShip
        </NuxtLink>
        <span class="onboarding-step">01 / 01</span>
      </header>

      <div class="onboarding-grid">
        <div class="onboarding-copy">
          <p class="auth-eyebrow">YOUR WORKSPACE</p>
          <h1>What should we call your shipping operation?</h1>
          <p>
            This becomes the secure workspace for your team, shipments,
            integrations and billing.
          </p>
        </div>

        <UForm class="onboarding-form" @submit.prevent="createWorkspace">
          <UFormField label="Company or workspace name">
            <UInput
              v-model="organizationName"
              size="xl"
              placeholder="Acme Distribution"
              maxlength="120"
              required
            />
          </UFormField>

          <UFormField
            label="Workspace ID"
            hint="Lowercase letters, numbers and hyphens"
          >
            <UInput
              :model-value="organizationSlug"
              size="xl"
              placeholder="acme-distribution"
              maxlength="80"
              required
              @update:model-value="updateSlug(String($event))"
            >
              <template #leading>
                <span class="slug-prefix">sigmaship /</span>
              </template>
            </UInput>
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="subtle"
            :description="errorMessage"
          />

          <UButton
            type="submit"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
            :loading="submitting"
          >
            Enter SigmaShip
          </UButton>
        </UForm>
      </div>
    </section>
  </main>
</template>
