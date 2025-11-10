/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
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
