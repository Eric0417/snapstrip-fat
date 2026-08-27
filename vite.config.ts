import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const isPublicBuild = process.env.VITE_PUBLIC_BUILD === 'true';

function copyPackAssets() {
  let outDir = 'dist';

  return {
    name: 'copy-pack-assets',
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const packs = ['packs/core-kawaii', 'packs/core-effects'];
      if (!isPublicBuild) packs.push('packs/fan-ip', 'packs/templates');

      for (const pack of packs) {
        const source = resolve(process.cwd(), pack);
        const target = resolve(process.cwd(), outDir, pack);
        if (existsSync(source)) cpSync(source, target, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyPackAssets()],
  define: {
    __VITE_PUBLIC_BUILD__: JSON.stringify(isPublicBuild),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
