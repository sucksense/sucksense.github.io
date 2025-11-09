import { defineConfig } from 'vite'

import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

export default defineConfig({
    plugins: [
        obfuscatorPlugin({
            options: {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.5,
                debugProtection: true,
                disableConsoleOutput: true,
                identifierNamesGenerator: 'mangled-shuffled',
                renameGlobals: true,
                selfDefending: true,
                simplify: true,
                splitStrings: true,
                splitStringsChunkLength: 6,
                stringArray: true,
                stringArrayEncoding: ['rc4'],
                stringArrayRotate: true,
                stringArrayShuffle: true,
                stringArrayWrappersCount: 3,
                stringArrayWrappersChainedCalls: true,
                stringArrayThreshold: 1,
                transformObjectKeys: true,
                unicodeEscapeSequence: true
            },
        }),
    ],
});