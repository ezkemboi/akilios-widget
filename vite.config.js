import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'AkiliOSWidget',
      fileName: () => 'akilios-widget.js',
      formats: ['iife'], // builds a <script> friendly global
    },
    minify: true,
    rollupOptions: {
      output: {
        assetFileNames: 'akilios-widget.css'
      }
    }
  }
});
