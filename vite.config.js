import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Innehållspolicy (CSP) för den byggda sajten. GitHub Pages kan inte sätta
// egna headers och zonens gemensamma regel på buildapp.se saknar script-src,
// så policyn ligger som <meta> i sidan. Bara skript från sajten själv, inga
// inline-skript. Typsnitten kommer från Google Fonts, bilder från sajten eller
// via https (datamodellen tillåter en extern URL i `image`).
// Läggs bara in vid bygge: dev-servern kör ett inline-skript för React som
// policyn annars skulle stoppa.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' https: data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

const csp = {
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
  ],
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), csp],
  base: mode === 'gh' ? '/tidslinje/' : '/',
}))
