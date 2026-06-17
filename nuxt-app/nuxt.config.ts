// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // 关闭子目录前缀，components/layout/SiteHeader.vue 直接用 <SiteHeader>
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }]
  },

  // 关闭所有外部字体提供商（国内网络无法访问）
  fonts: {
    providers: { google: false, googleicons: false, fontsource: false, bunny: false }
  },

  routeRules: {
    '/api/**': { cors: true }
  },

  compatibilityDate: '2025-01-15',

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
    public: {
      apiBase: '/api'
    }
  },

  vite: {
    optimizeDeps: {
      include: ['pdfjs-dist']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
