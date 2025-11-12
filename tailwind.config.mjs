/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Field & Tides Brand Palette
        'field': {
          DEFAULT: '#114C87', // Deep Navy
          light: '#1a5fa0',
          dark: '#0d3a65',
          'ultra-dark': '#081928' // Midnight
        },
        'champagne': {
          DEFAULT: '#F4E297', // Gold
          light: '#f7e9b0',
          dark: '#e3d899'
        },
        'shell': {
          DEFAULT: '#FEFDFC', // Soft White
          dark: '#f5f4f3'
        },
        'copper': {
          DEFAULT: '#C07A3A', // Warm Copper Accent
          light: '#d08f5a',
          dark: '#a8652e'
        },
        'teal': {
          DEFAULT: '#3D6C72', // Muted Teal Accent
          light: '#4d8089',
          dark: '#2d5158'
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        fieldtides: {
          "primary": "#114C87",
          "secondary": "#F4E297",
          "accent": "#C07A3A",
          "neutral": "#081928",
          "base-100": "#FEFDFC",
          "info": "#3D6C72",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
}
