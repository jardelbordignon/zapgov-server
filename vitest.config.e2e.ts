import { defineConfig } from 'vitest/config'

import { userConfig } from './vitest.config'

export default defineConfig({
  ...userConfig,
  test: {
    ...userConfig.test,
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
  },
})
