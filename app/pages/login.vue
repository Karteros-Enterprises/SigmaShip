<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

useHead({
  title: 'Sign in'
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

async function signIn() {
  errorMessage.value = ''
  submitting.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
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
  <main class="auth-page">
    <section class="auth-panel">
      <NuxtLink to="/" class="auth-brand">
        <span>Σ</span>
        SigmaShip
      </NuxtLink>

      <div class="auth-heading">
        <p class="auth-eyebrow">SHIPPING, OPTIMIZED.</p>
        <h1>Welcome back.</h1>
        <p>Sign in to quote, ship, track and manage your operation.</p>
      </div>

      <UForm class="auth-form" @submit.prevent="signIn">
        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            required
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
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
          Sign in
        </UButton>
      </UForm>

      <p class="auth-switch">
        New to SigmaShip?
        <NuxtLink to="/register">Create an account</NuxtLink>
      </p>
    </section>

    <aside class="auth-visual">
      <div class="auth-visual-copy">
        <span>ONE WORKSPACE</span>
        <strong>Every carrier.<br>One calculation.</strong>
      </div>
      <div class="auth-signal" aria-hidden="true">
        <i v-for="index in 12" :key="index" />
      </div>
    </aside>
  </main>
</template>
