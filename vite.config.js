// vite.config.js
export default {
  plugins: [],
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['iife'], // Immediately Invoked Function Expression
      name: 'AkiliOSWidget',
      fileName: () => 'akilios-widget.js',
    },
    minify: true,
    rollupOptions: {
      output: {
        globals: {}
      }
    }
  }
};
