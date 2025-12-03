import { defineConfig } from '@playwright/test'

export default defineConfig({
  timeout: 3000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
  }
})
