import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts', './src/test/accessibility-setup.ts'],
        include: ['src/**/*.accessibility.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', '.next'],
        testTimeout: 30000 // Accessibility tests may take longer
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