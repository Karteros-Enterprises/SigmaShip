<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

useHead({
  title: 'Create account'
})

const supabase = useSupabaseClient()
const fullName = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const confirmationSent = ref(false)
const resendMessage = ref('')
const resendError = ref('')

async function register() {
  errorMessage.value = ''
  submitting.value = true

  const { data, error } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
      data: {
        full_name: fullName.value.trim()
      }
    }
  })

  submitting.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  if (!data.session) {
    confirmationSent.value = true
    return
  }

  await navigateTo('/onboarding')
}
async function resendConfirmation() {
  resendMessage.value = ''
  resendError.value = ''

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.value.trim(),
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`
    }
  })

  if (error) {
    resendError.value = error.message
    return
  }

  resendMessage.value = 'Confirmation email sent again. Check your inbox and spam folder.'
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel">
      <NuxtLink to="/" class="auth-brand">
        <span>Σ</span>
        SigmaShip
      </NuxtLink>

      <template v-if="!confirmationSent">
        <div class="auth-heading">
          <p class="auth-eyebrow">START SHIPPING</p>
          <h1>Build your workspace.</h1>
          <p>Create your account. Your company setup comes next.</p>
        </div>

        <UForm class="auth-form" @submit.prevent="register">
          <UFormField label="Full name">
            <UInput
              v-model="fullName"
              autocomplete="name"
              placeholder="Your name"
              required
            />
          </UFormField>

          <UFormField label="Work email">
            <UInput
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@company.com"
              required
            />
          </UFormField>

          <UFormField label="Password" hint="Minimum 8 characters">
            <UInput
              v-model="password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              placeholder="Create a password"
              required
            />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="subtle"
            :description="errorMessage"
          />

          <UButton
            type="submit"
            block
            size="lg"
            :loading="submitting"
          >
            Create account
          </UButton>
        </UForm>
      </template>

      <div v-else class="auth-heading">
        <p class="auth-eyebrow">CHECK YOUR EMAIL</p>
        <h1>Confirm your account.</h1>
        <p>We sent a confirmation link to <strong>{{ email }}</strong>.</p>
        <p v-if="resendMessage">{{ resendMessage }}</p>
        <UAlert v-if="resendError" color="error" variant="subtle" :description="resendError" />
        <UButton variant="outline" :loading="submitting" @click="resendConfirmation">Resend confirmation email</UButton>
      </div>

      <p class="auth-switch">
        Already have an account?
        <NuxtLink to="/login">Sign in</NuxtLink>
      </p>
    </section>

    <aside class="auth-visual">
      <div class="auth-visual-copy">
        <span>FROM QUOTE TO DOORSTEP</span>
        <strong>Move faster.<br>Ship smarter.</strong>
      </div>
      <div class="auth-signal" aria-hidden="true">
        <i v-for="index in 12" :key="index" />
      </div>
    </aside>
  </main>
</template>
