/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Claude风格配色 - 更加温暖和沉浸
        claude: {
          cream: '#FBF8F5', // 更温暖的奶油色
          dark: '#0F0F0F', // 更深的黑色，更沉浸
          gray: {
            50: '#FCFCFB',
            100: '#F7F6F5',
            200: '#EFEDE9',
            300: '#E6E2DD',
            400: '#B5AFA8',
            500: '#8A817A',
            600: '#635B55',
            700: '#4A453F',
            800: '#2F2A24',
            900: '#1A1614',
          }
        },
        paper: {
          light: '#FFFEFД', // 纸张般的纯白
          dark: '#1C1C1C' // 深色模式下的温暖灰色
        },
        // 新增更丰富的配色
        warm: {
          50: '#FEF7F0',
          100: '#FDEDE0',
          200: '#FBD9C0',
          300: '#F8C19F',
          400: '#F5A77F',
          500: '#F28D5E',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'Noto Sans', 
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'paper': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'paper-dark': '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'soft': '0 2px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'neumorphism': '8px 8px 16px rgba(163, 157, 148, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.9)',
        'neumorphism-dark': '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'inset': 'inset 2px 2px 4px rgba(163, 157, 148, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)',
        'inset-dark': 'inset 2px 2px 4px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}