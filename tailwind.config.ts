import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Pure Monochrome Palette (Absolute Blacks & Grays)
        neutral: {
          50: '#F9F9F9',
          100: '#EDEDED',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#1A1A1A',
          900: '#000000', // Absolute Black
          950: '#000000',
        },
      },
      borderRadius: {
        'xl': '0.75rem',    
        '2xl': '1rem',      
        '3xl': '1.5rem',    
      },
      boxShadow: {
        'bento': '0 4px 6px -1px rgb(0 0 0 / 0.02), 0 2px 4px -1px rgb(0 0 0 / 0.02)',
        'hover': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -2px rgb(0 0 0 / 0.025)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;