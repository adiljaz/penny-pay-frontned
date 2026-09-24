/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pp: {
          bg: '#FFFFFF',
          'bg-soft': '#FAFAFA',
          text: '#171717',
          'text-secondary': '#737373',
          'text-muted': '#A3A3A3',
          border: '#E8E8E8',
          'border-strong': '#D4D4D4',
          accent: '#6D4AFF',
          'accent-hover': '#5B3AE6',
          'accent-soft': '#F3EFFF',
          'accent-border': '#D4C7FF',
          success: '#16A34A',
          'success-soft': '#F0FDF4',
          'success-border': '#BBF7D0',
          warning: '#D97706',
          'warning-soft': '#FFFBEB',
          'warning-border': '#FDE68A',
          error: '#DC2626',
          'error-soft': '#FEF2F2',
          'error-border': '#FECACA',
          info: '#2563EB',
          'info-soft': '#EFF6FF',
          'info-border': '#BFDBFE',
        },
      },
      fontSize: {
        'label': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'table': ['13px', { lineHeight: '20px' }],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'slide-in-right': 'slideInRight 250ms ease-out',
        'slide-in-left': 'slideInLeft 250ms ease-out',
        'toast-in': 'toastIn 300ms ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
