import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts', './src/test/integration-setup.ts'],
        include: ['src/**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', '.next'],
        testTimeout: 60000, // Integration tests may take longer
        pool: 'forks', // Run integration tests in separate processes
        poolOptions: {
            forks: {
                singleFork: true // Prevent database conflicts
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/components': resolve(__dirname, './src/components'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/hooks': resolve(__dirname, './src/hooks'),
            '@/styles': resolve(__dirname, './src/styles')
        }
    }
})