<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Set up your ΣigmaSpace'
})

const supabase = useSupabaseClient<Database>()
const organizationName = ref('')
const organizationSlug = ref('')
const slugTouched = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const checkingWorkspace = ref(true)
const nameAvailable = ref<boolean | null>(null)
const slugAvailable = ref<boolean | null>(null)
const checkingAvailability = ref(false)
let availabilitySequence = 0
async function checkAvailability() {
  const name = organizationName.value.trim()
  const slug = slugify(organizationSlug.value)
  const sequence = ++availabilitySequence
  nameAvailable.value = null
  slugAvailable.value = null
  if (!name || !slug) return
  checkingAvailability.value = true
  const { data, error } = await supabase.rpc('sigma_space_availability', { candidate_name: name, candidate_slug: slug })
  if (sequence !== availabilitySequence) return
  checkingAvailability.value = false
  if (error) return
  const result = Array.isArray(data) ? data[0] : data
  nameAvailable.value = result?.name_available ?? null
  slugAvailable.value = result?.slug_available ?? null
}
let availabilityTimer: ReturnType<typeof setTimeout> | undefined
watch([organizationName, organizationSlug], () => {
  clearTimeout(availabilityTimer)
  availabilityTimer = setTimeout(checkAvailability, 400)
})

onMounted(async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  const currentUser = authData.user

  if (authError || !currentUser?.id) {
    checkingWorkspace.value = false
    return
  }

  const { data: onboardingState, error } = await supabase
    .from('onboarding_states')
    .select('organization_id, completed')
    .eq('user_id', currentUser.id)
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
  if (slugTouched.value) return
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
  if (checkingWorkspace.value || submitting.value) return

  errorMessage.value = ''

  const { data: authData, error: authError } = await supabase.auth.getUser()
  const currentUser = authData.user

  if (authError || !currentUser?.id) {
    errorMessage.value = 'Your session has expired. Please sign in again.'
    return
  }

  const name = organizationName.value.trim()
  const slug = slugify(organizationSlug.value)

  if (!name || !slug) {
    errorMessage.value = 'Enter a company name and ΣigmaSpace ID.'
    return
  }

  await checkAvailability()
  if (nameAvailable.value === false || slugAvailable.value === false) {
    errorMessage.value = 'That ΣigmaSpace name or ID is already in use. Choose another.'
    return
  }
  submitting.value = true

  try {
    const { error } = await supabase.rpc('create_organization', {
      organization_name: name,
      organization_slug: slug
    })

    if (error) {
      if (error.message.toLowerCase().includes('already belongs')) {
        await navigateTo('/ship', { replace: true })
        return
      }

      errorMessage.value = error.code === '23505' ? 'That ΣigmaSpace name or ID is already in use.' : error.message
      return
    }

    await navigateTo('/ship', { replace: true })
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to create your ΣigmaSpace. Please try again.'
  } finally {
    submitting.value = false
  }
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
          <p class="auth-eyebrow">YOUR ΣIGMASPACE</p>
          <h1>What should we call your shipping operation?</h1>
          <p>
            This becomes the secure ΣigmaSpace for your team, shipments,
            integrations and billing.
          </p>
        </div>

        <form class="onboarding-form" @submit.prevent="createWorkspace">
          <div class="onboarding-field">
            <label for="organization-name">Company or ΣigmaSpace name</label>
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
              <label for="organization-slug">ΣigmaSpace ID</label>
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

          <p v-if="checkingAvailability" class="availability-status">Checking name and ID availability…</p>
          <p v-else-if="nameAvailable === false" class="availability-status availability-error">That company or ΣigmaSpace name is already in use.</p>
          <p v-else-if="slugAvailable === false" class="availability-status availability-error">That ΣigmaSpace ID is already in use.</p>
          <p v-else-if="nameAvailable && slugAvailable" class="availability-status availability-success">Name and ID are available.</p>
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
            :disabled="submitting || checkingWorkspace || checkingAvailability || nameAvailable === false || slugAvailable === false"
          >
            Enter SigmaShip
          </UButton>
        </form>
      </div>
    </section>
  </main>
</template>



<style scoped>
.onboarding-page{min-height:100vh;padding:28px;background:#0b0c0d;box-sizing:border-box}
.onboarding-shell{width:100%;min-height:calc(100vh - 56px);padding:42px 52px;border-radius:22px;background:#f7f6f1;color:#0b0c0d;box-sizing:border-box}
.onboarding-header{display:flex;align-items:center;justify-content:space-between;max-width:1440px;margin:0 auto}
.onboarding-header .auth-brand{position:static}
.onboarding-grid{width:100%;max-width:1440px;min-height:calc(100vh - 190px);margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,520px);gap:clamp(72px,9vw,160px);align-items:center}
.onboarding-copy{min-width:0;align-self:center}
.onboarding-copy h1{margin:0;max-width:720px;font-size:clamp(56px,5.25vw,84px);font-weight:650;letter-spacing:-.055em;line-height:.94}
.onboarding-copy>p:last-child{max-width:500px;margin:24px 0 0;color:#64676a;font-size:15px;line-height:1.65}
.onboarding-form{width:100%;box-sizing:border-box;display:grid;gap:24px;padding:42px;border:1px solid #d8d7d0;border-radius:20px;background:#fff;box-shadow:0 30px 90px rgba(11,12,13,.08)}
.onboarding-field{width:100%;display:grid;gap:9px}
.onboarding-field-heading{display:flex;align-items:baseline;justify-content:space-between;gap:18px}
.onboarding-field label{color:#161719;font-size:12px;font-weight:750}
.onboarding-field-heading span{color:#777b80;font-size:12px}
.onboarding-field>input,.workspace-id-control{width:100%;min-height:56px;border:1px solid #d8d7d0;border-radius:10px;background:#f7f6f1;color:#0b0c0d;box-sizing:border-box}
.onboarding-field>input{padding:0 16px;font:inherit;font-size:15px}
.workspace-id-control{padding:0 16px;display:flex;align-items:center}
.workspace-id-control input{min-width:0;flex:1;height:54px;padding:0;border:0;outline:0;background:transparent;color:#0b0c0d;font:inherit;font-size:15px}
.slug-prefix{flex:0 0 auto;margin-right:8px;white-space:nowrap;color:#747772;font-size:13px;font-weight:750}
.onboarding-form button[type=submit]{width:100%;min-height:56px;justify-content:center;border-radius:10px;background:#d8ff3e;color:#0b0c0d;font-size:14px;font-weight:800;box-shadow:none}
@media(max-width:1050px){.onboarding-grid{grid-template-columns:1fr;gap:44px;padding:70px 0 30px}.onboarding-copy h1{max-width:760px}.onboarding-form{max-width:560px}}
@media(max-width:640px){.onboarding-page{padding:0}.onboarding-shell{min-height:100vh;padding:26px 20px;border-radius:0}.onboarding-grid{padding:64px 0 24px}.onboarding-copy h1{font-size:clamp(44px,14vw,64px)}.onboarding-form{padding:26px 20px}.onboarding-field-heading{align-items:flex-start;flex-direction:column;gap:4px}}
</style>

<style scoped>
.availability-status{font-size:12px;margin:0;color:#555}.availability-error{color:#b42318}.availability-success{color:#237a38}
</style>
