import swc from 'unplugin-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { UserConfig, defineConfig } from 'vitest/config'

export const userConfig: UserConfig = {
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    root: './',
  },
}

export default defineConfig(userConfig)
