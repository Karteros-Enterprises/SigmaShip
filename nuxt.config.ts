export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  css: ['~/assets/css/main.css'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      titleTemplate: '%s · SigmaShip',
      meta: [
        {
          name: 'description',
          content: 'Compare rates, create labels, track shipments and manage every order in one shipping workspace.'
        }
      ]
    }
  },

  supabase: {
    redirect: false
  },

  runtimeConfig: {
    // Declare the private key explicitly so Nitro accepts the
    // NUXT_SUPABASE_SECRET_KEY runtime override in Vercel functions.
    // Never expose this through runtimeConfig.public.
    supabase: {
      secretKey: ''
    },
    public: {
      appName: 'SigmaShip'
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  }
})
