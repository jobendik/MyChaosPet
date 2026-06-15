import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build can be served from any sub-path
// (itch.io, CrazyGames, GitHub Pages, etc.), not just the domain root.
export default defineConfig({
  base: './',
  plugins: [react()],
});
