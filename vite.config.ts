import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  //cloud flare build  
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'tools': ['@ffmpeg/ffmpeg', '@ffmpeg/util', 'react', 'react-dom', 'lucide-react', 'input-otp',
             'react-resizable-panels', 'react-hook-form', 'react-day-picker', 'react-router-dom', 'recharts',
             'sonner', 'tailwind-merge', 'tailwindcss-animate', 'clsx', 'cmdk', 'date-fns',
             'embla-carousel-react', '@tanstack/react-query', '@radix-ui/react-slider', '@radix-ui/react-toast',
             '@radix-ui/react-tooltip', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toggle',
             '@radix-ui/react-toggle-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select',
             '@radix-ui/react-separator', '@radix-ui/react-progress', '@radix-ui/react-popover',
             '@radix-ui/react-navigation-menu', '@radix-ui/react-menubar', '@radix-ui/react-label',
             '@radix-ui/react-hover-card', '@radix-ui/react-dialog', '@radix-ui/react-context-menu',
             '@radix-ui/react-dropdown-menu', '@radix-ui/react-radio-group', '@radix-ui/react-slot',
             'class-variance-authority'],
       
        }
      }
    }
  }
}));