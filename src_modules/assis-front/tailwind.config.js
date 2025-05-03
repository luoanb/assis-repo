// tailwind.config.js
import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        logo: ['YouSheBiaoTiHei', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  darkMode: 'class',
  plugins: [
    nextui({
      layout: {
        // radius: {
        //   small: '8px', // rounded-small
        //   medium: '12px', // rounded-medium
        //   large: '14px' // rounded-large
        // }
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#8A56CC',
              foreground: '#FFFFFF'
            },
            'jh-link': {
              DEFAULT: '#4093FF'
            }
          }
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#673ab7'
            },
            'jh-link': {
              DEFAULT: '#4093FF'
            }
          }
        }
      }
    })
  ]
}
