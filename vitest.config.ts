import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'server/providers/carriers/sandbox/adapter.ts',
        'server/services/pricing.ts',
        'shared/schemas/shipping.ts'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 60
      }
    }
  }
})
