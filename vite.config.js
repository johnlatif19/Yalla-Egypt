import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        tours: 'tours/index.html',
        tourDetails: 'tours/details.html',
        booking: 'booking/index.html',
        bookingConfirmation: 'booking/confirmation.html',
        about: 'about/index.html',
        contact: 'contact/index.html',
        login: 'login/index.html',
        dashboard: 'dashboard/index.html',
        dashboardTours: 'dashboard/tours/index.html',
        dashboardBookings: 'dashboard/bookings/index.html',
        dashboardGallery: 'dashboard/gallery/index.html',
        dashboardSettings: 'dashboard/settings/index.html'
      }
    }
  }
});
