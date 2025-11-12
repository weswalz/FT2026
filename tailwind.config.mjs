/** @type {import('tailwindcss').Config} */
const fluid = (min, mid, max) => [
  `clamp(${min}rem, ${mid}, ${max}rem)`,
  { lineHeight: '1.25' }
];

const fluidBody = (min, mid, max) => [
  `clamp(${min}rem, ${mid}, ${max}rem)`,
  { lineHeight: '1.5' }
];

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontSize: {
      xs: fluidBody(0.6, '0.55rem + 0.08vw', 0.68),
      sm: fluidBody(0.68, '0.6rem + 0.12vw', 0.78),
      base: fluidBody(0.82, '0.65rem + 0.2vw', 0.95),
      lg: fluidBody(0.92, '0.7rem + 0.25vw', 1.05),
      xl: fluid(1.05, '0.8rem + 0.35vw', 1.2),
      '2xl': fluid(1.2, '0.9rem + 0.45vw', 1.4),
      '3xl': fluid(1.35, '1rem + 0.6vw', 1.6),
      '4xl': fluid(1.55, '1.1rem + 0.75vw', 1.9),
      '5xl': fluid(1.8, '1.3rem + 0.9vw', 2.2),
      '6xl': fluid(2.1, '1.5rem + 1.1vw', 2.6)
    },
    extend: {
      colors: {
        field: {
          navy: '#114C87',
          gold: '#F4E297',
          shell: '#FEFDFC',
          midnight: '#081928',
          copper: '#C07A3A'
        },
        champagne: '#F4E297',
        midnight: '#081928'
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      spacing: {
        '100': '100px'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
