import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  test: {
    environment: 'node',
    // Scope to this package only — packages/* and apps/* own their own
    // vitest config and are run via `pnpm --filter <name> test`.
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    // The app itself has no tests of its own yet (they all live in
    // @kara/domain right now) — an empty suite shouldn't fail CI.
    passWithNoTests: true,
  },
})