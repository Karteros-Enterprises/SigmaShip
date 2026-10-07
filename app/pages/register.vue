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

async function register() {
  errorMessage.value = ''
  submitting.value = true

  const { data, error } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: {
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
