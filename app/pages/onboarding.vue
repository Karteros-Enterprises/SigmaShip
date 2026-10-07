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
const checkingWorkspace = ref(true)

onMounted(async () => {
  if (!user.value) {
    checkingWorkspace.value = false
    return
  }

  const { data: onboardingState, error } = await supabase
    .from('onboarding_states')
    .select('organization_id, completed')
    .eq('user_id', user.value.id)
    .maybeSingle()

  checkingWorkspace.value = false

  if (error) {
    console.warn('Unable to read onboarding state; allowing workspace recovery', error)
    return
  }

  if (onboardingState?.organization_id && onboardingState.completed) {
    await navigateTo('/ship', { replace: true })
  }
})

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
  if (checkingWorkspace.value) {
    return
  }

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
    if (error.message.toLowerCase().includes('already belongs')) {
      await navigateTo('/ship', { replace: true })
      return
    }

    errorMessage.value = error.message
    return
  }

  await navigateTo('/ship', { replace: true })
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
          <div class="onboarding-field">
            <label for="organization-name">Company or workspace name</label>
            <input
              id="organization-name"
              v-model="organizationName"
              type="text"
              placeholder="Acme Distribution"
              maxlength="120"
              autocomplete="organization"
              required
            >
          </div>

          <div class="onboarding-field">
            <div class="onboarding-field-heading">
              <label for="organization-slug">Workspace ID</label>
              <span>Lowercase letters, numbers and hyphens</span>
            </div>

            <div class="workspace-id-control">
              <span class="slug-prefix">sigmaship /</span>
              <input
                id="organization-slug"
                :value="organizationSlug"
                type="text"
                placeholder="acme-distribution"
                maxlength="80"
                spellcheck="false"
                required
                @input="updateSlug(($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>

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
            :loading="submitting || checkingWorkspace"
            :disabled="checkingWorkspace"
          >
            Enter SigmaShip
          </UButton>
        </UForm>
      </div>
    </section>
  </main>
</template>
