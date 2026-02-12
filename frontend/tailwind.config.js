export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Professional classical palette - Navy/Slate based (v2)
        primary: '#2c3e50',      // Deep navy-slate (buttons, accents)
        secondary: '#34495e',    // Medium slate
        success: '#27ae60',      // Forest green
        warning: '#d68910',      // Burnt orange
        danger: '#f8867aff',       // Deep red
        muted: '#7f8c8d',        // Cool gray
        // Backgrounds
        bg: {
          primary: '#f8f9fa',    // Off-white
          secondary: '#ffffff'   // Pure white
        },
        text: {
          primary: '#2c3e50',    // Deep navy
          secondary: '#7f8c8d'   // Cool gray
        },
        border: '#ecf0f1'        // Light gray border
      },
      backgroundColor: {
        'paper': '#f8f9fa',
        'surface': '#ffffff'
      },
      borderColor: {
        'line': '#ecf0f1'
      },
      boxShadow: {
        'line': '0 1px 0 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-in-out',
        'slide-up': 'slideUp 150ms ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
