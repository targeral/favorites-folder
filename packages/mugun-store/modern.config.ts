import { moduleTools, defineConfig } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: 'npm-component-with-umd',
  buildConfig: {
    define: {
      BASE_URL: process.env.BASE_URL ?? '',
    },
  },
});
