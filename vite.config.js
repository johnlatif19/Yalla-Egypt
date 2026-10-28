import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tours: resolve(__dirname, 'tours/index.html'),
        tourDetails: resolve(__dirname, 'tours/details.html'),
        booking: resolve(__dirname, 'booking/index.html'),
        bookingConfirmation: resolve(__dirname, 'booking/confirmation.html'),
        about: resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        login: resolve(__dirname, 'login/index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        dashboardTours: resolve(__dirname, 'dashboard/tours/index.html'),
        dashboardBookings: resolve(__dirname, 'dashboard/bookings/index.html'),
        dashboardGallery: resolve(__dirname, 'dashboard/gallery/index.html'),
        dashboardSettings: resolve(__dirname, 'dashboard/settings/index.html')
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
