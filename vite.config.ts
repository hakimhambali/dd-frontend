import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default ({ mode }: { mode: any }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

    const domain = process.env.VITE_DOMAIN

    return defineConfig({
        build: {
            sourcemap: true,
        },
        plugins: [
            basicSsl(),
            vue(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            host: domain,
            hmr: {
                host: domain,
            },
        }
    })
}
