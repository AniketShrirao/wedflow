// Authentication configuration based on environment
export const authConfig = {
    // In development, we typically don't want email confirmation
    requireEmailConfirmation: process.env.NODE_ENV === 'production',

    // Redirect URLs
    redirectUrls: {
        signIn: '/dashboard',
        signUp: process.env.NODE_ENV === 'development' ? '/dashboard' : '/auth/verify-email',
        signOut: '/auth/login',
    },

    // Development helpers
    isDevelopment: process.env.NODE_ENV === 'development',
}