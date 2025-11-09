import { defineConfig } from 'vite'
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      plugins: [
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
            passes: 3,
          },
          format: {
            comments: false
          }
        }),
        obfuscatorPlugin({
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          numbersToExpressions: true,
          simplify: true,
          stringArray: true,
          stringArrayEncoding: ['rc4'],
          stringArrayThreshold: 0.9,
          transformObjectKeys: true,
          debugProtection: true, // твоя опция
          debugProtectionInterval: true,
          disableConsoleOutput: true,
          rotateStringArray: true,
        }),
      ],
    },
  },
  plugins: [

  ],
});
