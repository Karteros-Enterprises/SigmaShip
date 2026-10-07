export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  modules: [
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
    public: {
      appName: 'SigmaShip'
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  }
})
