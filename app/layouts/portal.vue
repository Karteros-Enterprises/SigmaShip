<script setup lang="ts">
import { portalNavigation } from '~/config/navigation'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const open = ref(false)

const userInitials = computed(() => {
  const fullName = String(user.value?.user_metadata?.full_name ?? '').trim()

  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  return user.value?.email?.slice(0, 2).toUpperCase() || 'SS'
})

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <div class="portal-shell">
    <aside class="portal-sidebar" :class="{ 'is-open': open }">
      <NuxtLink to="/ship" class="portal-brand" @click="open = false">
        <span class="portal-brand-mark">Σ</span>
        <span>SigmaShip</span>
      </NuxtLink>

      <nav class="portal-navigation" aria-label="ΣigmaSpace navigation">
        <section
          v-for="group in portalNavigation"
          :key="group.label"
          class="portal-nav-group"
        >
          <p>{{ group.label }}</p>

          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="portal-nav-link"
            :class="{ 'is-active': isActive(item.to) }"
            @click="open = false"
          >
            <UIcon :name="item.icon" />
            <span>{{ item.label }}</span>
            <UBadge v-if="item.badge" size="xs" variant="subtle">
              {{ item.badge }}
            </UBadge>
          </NuxtLink>
        </section>
      </nav>

      <div class="portal-sidebar-footer">
        <p>ΣigmaSpace · Need help?</p>
        <NuxtLink to="/integrations">Manage integrations</NuxtLink>
      </div>
    </aside>

    <div class="portal-main">
      <header class="portal-topbar">
        <UButton
          class="portal-mobile-menu"
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          aria-label="Open navigation"
          @click="open = !open"
        />

        <div class="portal-command-hint">
          <UIcon name="i-lucide-search" />
          <span>Search orders, tracking, invoices...</span>
          <UKbd value="meta">K</UKbd>
        </div>

        <div class="portal-topbar-actions">
          <UButton icon="i-lucide-bell" color="neutral" variant="ghost" aria-label="Notifications" />
          <UDropdownMenu
            :items="[[{ label: user?.email || 'Account', type: 'label' }], [{ label: 'Sign out', icon: 'i-lucide-log-out', onSelect: signOut }]]"
          >
            <UButton color="neutral" variant="ghost" aria-label="Account menu">
              <UAvatar :text="userInitials" size="sm" />
            </UButton>
          </UDropdownMenu>
        </div>
      </header>

      <main class="portal-workspace">
        <slot />
      </main>
    </div>
  </div>
</template>
