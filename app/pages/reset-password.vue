<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Choose new password' })
const supabase = useSupabaseClient()
const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const ready = ref(false)
const busy = ref(false)
const success = ref(false)
const errorMessage = ref('')
onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) { errorMessage.value = 'This reset link is invalid or expired. Request another one.'; return }
  }
  const { data } = await supabase.auth.getUser()
  if (!data.user) { errorMessage.value = 'This reset link is invalid or expired. Request another one.'; return }
  ready.value = true
})
async function updatePassword() {
  if (busy.value) return
  errorMessage.value = ''
  if (password.value.length < 8) { errorMessage.value = 'Use at least 8 characters.'; return }
  if (password.value !== confirmPassword.value) { errorMessage.value = 'Passwords do not match.'; return }
  busy.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  busy.value = false
  if (error) { errorMessage.value = error.message; return }
  success.value = true
  await supabase.auth.signOut()
}
</script>
<template>
  <main class="auth-page">
    <section class="auth-panel">
      <NuxtLink to="/" class="auth-brand"><span>Σ</span> SigmaShip</NuxtLink>
      <div class="auth-heading">
        <p class="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>{{ success ? 'Password updated.' : 'Create a new password.' }}</h1>
        <p>{{ success ? 'Your password has been changed. Sign in to continue.' : 'Choose a new password for your SigmaShip account.' }}</p>
      </div>
      <form v-if="ready && !success" class="auth-form" @submit.prevent="updatePassword">
        <UFormField label="New password"><UInput v-model="password" type="password" autocomplete="new-password" minlength="8" required class="w-full" /></UFormField>
        <UFormField label="Confirm password"><UInput v-model="confirmPassword" type="password" autocomplete="new-password" minlength="8" required class="w-full" /></UFormField>
        <UAlert v-if="errorMessage" color="error" variant="subtle" :description="errorMessage" />
        <UButton type="submit" block size="lg" :loading="busy">Update password</UButton>
      </form>
      <UAlert v-else-if="errorMessage" color="error" variant="subtle" :description="errorMessage" />
      <p class="auth-switch"><NuxtLink :to="success ? '/login' : '/forgot-password'">{{ success ? 'Sign in' : 'Request a new link' }}</NuxtLink></p>
    </section>
    <aside class="auth-visual"><div class="auth-visual-copy"><span>SECURE ACCOUNT ACCESS</span><strong>Reset. Sign in.<br>Ship.</strong></div></aside>
  </main>
</template>
