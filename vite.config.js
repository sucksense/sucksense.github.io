import { defineConfig } from 'vite'

import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

export default defineConfig({
    plugins: [
        obfuscatorPlugin({
            options: {
                debugProtection: true,
            },
        }),
    ],
});