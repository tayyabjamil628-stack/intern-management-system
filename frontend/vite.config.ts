import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// GitHub Pages serves this app from a repository subpath:
//   https://tayyabjamil628-stack.github.io/intern-management-system/
// Locally (npm run dev / a plain npm run build run by hand) we want the
// app to keep working from the site root, so the subpath base is only
// applied when GITHUB_PAGES=true is set (the deploy workflow sets this).
const isGithubPagesBuild = process.env.GITHUB_PAGES === 'true';
const REPO_BASE_PATH = '/intern-management-system/';

export default defineConfig({
  base: isGithubPagesBuild ? REPO_BASE_PATH : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});