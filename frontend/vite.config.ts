import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// GitHub Pages serves this app from a repository subpath:
//   https://tayyabjamil628-stack.github.io/intern-management-system/
// Locally (npm run dev / a plain npm run build run by hand) we want the
// app to keep working from the site root, so the subpath base is only
// applied when GITHUB_PAGES=true is set (the deploy workflow sets this).
const isGithubPagesBuild = process.env.GITHUB_PAGES === 'true';
const REPO_BASE_PATH = '/intern-management-system/';

// GitHub Pages has no server-side rewrite rule, so a hard refresh or a
// direct visit to a client-side route (e.g. /admin/departments) has
// nothing to resolve and returns Pages' own 404 page before React
// Router ever runs. GitHub Pages does serve a custom 404.html for any
// unmatched path, so the standard fix is to ship a 404.html that is
// just a copy of index.html: the SPA shell loads, React Router reads
// the current URL, and renders the matching route client-side. This
// only copies a static file post-build; it does not add a dependency
// or change routing logic.
function spaFallback404(): Plugin {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(outDir, 'index.html');
      const fallbackPath = path.join(outDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallbackPath);
      }
    },
  };
}

export default defineConfig({
  base: isGithubPagesBuild ? REPO_BASE_PATH : '/',
  plugins: [react(), tailwindcss(), spaFallback404()],
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