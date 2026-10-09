<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Forgot password' })
const supabase = useSupabaseClient()
const email = ref('')
const busy = ref(false)
const sent = ref(false)
const errorMessage = ref('')
async function requestReset() {
  if (busy.value) return
  busy.value = true
  errorMessage.value = ''
  const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: `${window.location.origin}/reset-password`
  })
  busy.value = false
  if (error) { errorMessage.value = error.message; return }
  sent.value = true
}
</script>
<template>
  <main class="auth-page">
    <section class="auth-panel">
      <NuxtLink to="/" class="auth-brand"><span>Σ</span> SigmaShip</NuxtLink>
      <div class="auth-heading">
        <p class="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>Reset your password.</h1>
        <p v-if="sent">If an account exists for that email, a password reset link will arrive shortly. Check your spam folder too.</p>
        <p v-else>Enter your account email and we'll send a secure reset link.</p>
      </div>
      <form v-if="!sent" class="auth-form" @submit.prevent="requestReset">
        <UFormField label="Email address"><UInput v-model="email" type="email" autocomplete="email" required class="w-full" /></UFormField>
        <UAlert v-if="errorMessage" color="error" variant="subtle" :description="errorMessage" />
        <UButton type="submit" block size="lg" :loading="busy">Send reset link</UButton>
      </form>
      <p class="auth-switch"><NuxtLink to="/login">Back to sign in</NuxtLink></p>
    </section>
    <aside class="auth-visual"><div class="auth-visual-copy"><span>SECURE ACCOUNT ACCESS</span><strong>Back to shipping.<br>Without the hassle.</strong></div></aside>
  </main>
</template>
