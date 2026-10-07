<script setup lang="ts">
import type { Database } from '~/types/database.types'
definePageMeta({
  layout: false
})

useHead({
  title: 'Confirming account'
})

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const errorMessage = ref('')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''

  if (!code) {
    errorMessage.value = 'This confirmation link is missing its authorization code.'
    return
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    errorMessage.value = error.message
    return
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', data.user?.id ?? '')
    .limit(1)
    .maybeSingle()

  await navigateTo(membership?.organization_id ? '/ship' : '/onboarding', { replace: true })
})
</script>

<template>
  <main class="auth-callback">
    <div class="auth-callback__card">
      <template v-if="errorMessage">
        <p class="auth-eyebrow">CONFIRMATION ERROR</p>
        <h1>We couldn't confirm your account.</h1>
        <p>{{ errorMessage }}</p>
        <UButton to="/login">Return to sign in</UButton>
      </template>

      <template v-else>
        <p class="auth-eyebrow">SIGMASHIP</p>
        <h1>Confirming your account.</h1>
        <p>Securing your session and opening your workspace.</p>
        <UIcon name="i-lucide-loader-circle" class="auth-callback__spinner" />
      </template>
    </div>
  </main>
</template>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: #080a09;
  color: #f6f5ef;
}

.auth-callback__card {
  width: min(32rem, 100%);
}

.auth-callback__card h1 {
  margin: 0.75rem 0 1rem;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.auth-callback__card p {
  color: #9b9e98;
  max-width: 28rem;
}

.auth-callback__spinner {
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 1.5rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
