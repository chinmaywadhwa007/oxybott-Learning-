/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ace: {
          bg: '#091320',
          secondary: '#13233A',
          card: '#18283D',
          accent: '#5BE4FF',
          textPrimary: '#FFFFFF',
          textSecondary: '#9BA9C2',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
        '30': '120px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'medium': '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 35px -5px rgba(91, 228, 255, 0.25)',
        'glow-lg': '0 0 60px -10px rgba(91, 228, 255, 0.35)',
      },
      maxWidth: {
        'container': '1440px',
        'hero-content': '560px',
        'hero-paragraph': '520px',
      }
    },
  },
  plugins: [],
}
