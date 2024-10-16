// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      BASE_URL: 'http://localhost:5103',
    },
  },  
 devtools: { enabled: false },
 ssr: false,

 build: {
 transpile: ['vuetify'],
},
imports: {
  dirs: ['stores'],
},
 modules: [
   (_options, nuxt) => {
     nuxt.hooks.hook('vite:extendConfig', (config) => {
       // @ts-expect-error
       config.plugins.push(vuetify({ autoImport: true }))
     })
   },
   '@pinia/nuxt',
   'dayjs-nuxt',
   'nuxt-lodash'
 ],
 vite: {
   vue: {
     template: {
       transformAssetUrls,
     },
   },
 },  
 lodash: {
  prefix: "_",
  prefixSkip: false,
  upperAfterPrefix: false,
},
 
 compatibilityDate: '2024-10-16',
})