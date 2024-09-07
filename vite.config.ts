import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default ({ mode }: { mode: any }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

    return defineConfig({
        build: {
            sourcemap: true,
        },
        plugins: [
            vue(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            host: process.env.VITE_DOMAIN
        },
    })
}
