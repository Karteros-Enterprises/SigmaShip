<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const errorMessage = ref('')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      errorMessage.value = error.message
      return
    }

    await navigateTo('/ship', { replace: true })
    return
  }

  await navigateTo(user.value ? '/ship' : '/login', { replace: true })
})
</script>

<template>
  <main class="entry-page">
    <div v-if="errorMessage" class="entry-page__message">
      <p class="auth-eyebrow">AUTHENTICATION ERROR</p>
      <h1>We couldn't open SigmaShip.</h1>
      <p>{{ errorMessage }}</p>
      <UButton to="/login">Return to sign in</UButton>
    </div>

    <div v-else class="entry-page__message">
      <p class="auth-eyebrow">SIGMASHIP</p>
      <h1>Opening your workspace.</h1>
      <p>One moment while we secure your session.</p>
    </div>
  </main>
</template>

<style scoped>
.entry-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: #080a09;
  color: #f6f5ef;
}

.entry-page__message {
  width: min(34rem, 100%);
}

.entry-page__message h1 {
  margin: 0.75rem 0 1rem;
  font-size: clamp(2.75rem, 7vw, 5rem);
  line-height: 0.94;
  letter-spacing: -0.06em;
}

.entry-page__message p {
  color: #9b9e98;
}
</style>
