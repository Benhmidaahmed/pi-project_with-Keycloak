export const environment = {
  production: false,
  apiUrl: 'http://localhost:8084', // Gateway URL
  services: {
    auth: '/authentication-service/api/auth',
    rides: '/ride-service/api/rides',
    bookings: '/booking-service/api/bookings',
    reviews: '/review-service/api/reviews',
    reports: '/report-service/api/reports',
    notifications: '/notifications-service/api/notifications',
    moderation: '/toxicity-service/api/moderation'
  }
};
