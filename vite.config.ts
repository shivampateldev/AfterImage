
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    // Source maps only in development — not included in production APK
    sourcemap: mode === 'development',
    // Increase chunk size limit warning (Phaser + Three.js are inherently large)
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // Split Phaser into its own chunk for better caching
        manualChunks: {
          'phaser-engine': ['phaser'],
          'react-vendor': ['react', 'react-dom'],
          'animation': ['framer-motion'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Minify in production
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2020',
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['phaser', 'react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
}));
