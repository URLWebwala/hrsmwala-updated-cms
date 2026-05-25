import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { glob } from 'glob';

const workdoPackages = glob.sync('packages/workdo/*/src/Resources/js/app.tsx');

export default defineConfig({
    base: './',
    plugins: [
        laravel({
            input:
            [
                'resources/css/app.css',
                'resources/js/app.tsx',
                ...workdoPackages
            ],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: 'localhost',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': '*',
        },
        watch: {
            ignored: ['**/vendor/**', '**/node_modules/**']
        },
        fs: {
            allow: ['..', 'packages']
        }
    },

    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        // Keep existing build/ folder during rebuilds so Laravel can keep serving
        // the previous manifest.json while a new one is being written. Without this,
        // Vite wipes public/build first and any page refresh during the ~15s build
        // window throws "Vite manifest not found".
        emptyOutDir: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
                    utils: ['date-fns', 'clsx']
                }
            },
        },
        assetsDir: 'assets',
    }
});
