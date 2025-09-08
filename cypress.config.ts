import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    supportFile: false,
    setupNodeEvents(_on, _config) {
      // implement node event listeners here if needed
    },
  },
});
