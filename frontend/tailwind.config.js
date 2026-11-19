/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#12345A', // Deep brand blue; headers
          800: '#174675', // Primary dark blue
          700: '#1D5B91', // Primary interaction
          600: '#2876B8', // Primary buttons & links
          500: '#3D8BCB', // Highlights / active accents
          100: '#E8F2FA', // Soft brand surface
          50: '#F4F8FC',  // Subtle background
        },
        gold: {
          700: '#A96F08', // Dark gold text
          500: '#E5A928', // Golden accent / 'Next in line'
          100: '#FFF4D8', // Highlight surface
        },
        semantic: {
          success: '#24734A',
          'success-bg': '#E5F4EB',
          destructive: '#B83232',
          'destructive-bg': '#FCE8E8',
          waiting: '#1D5B91',
          'waiting-bg': '#E8F2FA',
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(18, 52, 90, 0.06)',
      }
    },
  },
  plugins: [],
}
