/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Strategy: "Success & Growth"
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Main Primary (Emerald)
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // AI/Tech Accent Strategy: "Intelligence & Analysis"
        accent: {
          500: '#8b5cf6', // Violet for AI features
          600: '#7c3aed',
        },
        // Background & Surfaces (Modern Dark Theme)
        background: {
          DEFAULT: '#0f172a',   // Slate 900
          surface: '#1e293b',   // Slate 800 - for cards
          elevated: '#334155',  // Slate 700 - for hovers/modals
        },
        // Text Colors
        text: {
          primary: '#f8fafc',   // Slate 50
          secondary: '#94a3b8', // Slate 400
          muted: '#64748b',     // Slate 500
        }
      },
      fontFamily: {
        heading: ['Outfit', 'Inter', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)', // Subtle green glow for matched jobs
        'ai-glow': '0 0 20px rgba(139, 92, 246, 0.2)', // Violet glow for gap analysis
      }
    },
  },
  plugins: [],
}
