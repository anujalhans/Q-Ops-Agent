export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1419', // Darker base background
        surface2: '#1e2530', // Lighter card background with better contrast
        surface3: '#2a3441', // Even lighter for accents
        border: '#3a4451', // Softer border color
        brand: '#58a6ff',
        accent: '#39d353',
        error: '#f85149',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(56, 139, 253, 0.18)',
      },
    },
  },
  plugins: [],
}
