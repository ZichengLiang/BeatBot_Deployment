/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        gold: {
          '100': '#ffd700',
          '200': '#ffcc00',
          '300': '#d4af37',
        },
        silver: {
          '100': '#c0c0c0',
          '200': '#aaa9ad',
          '300': '#91a3b0',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // IBM Carbon Design colors
        ibm: {
          blue: '#0f62fe',
          gray: '#8d8d8d',
          'blue-60': '#0353e9',
          'gray-10': '#f4f4f4',
          'gray-20': '#e0e0e0',
          'gray-30': '#c6c6c6',
          'gray-40': '#a8a8a8',
          'gray-50': '#8d8d8d',
          'gray-60': '#6f6f6f',
          'gray-70': '#525252',
          'gray-80': '#393939',
          'gray-90': '#262626',
          'gray-100': '#161616',
          'blue-10': '#edf5ff',
          'blue-20': '#d0e2ff',
          'blue-30': '#a6c8ff',
          'blue-40': '#78a9ff',
          'blue-50': '#4589ff',
          'blue-60': '#0f62fe',
          'blue-70': '#0043ce',
          'blue-80': '#002d9c',
          'blue-90': '#001d6c',
          'blue-100': '#001141',
          'green-60': '#198038',
        },
        // Creative color palette
        creative: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          pink: '#EC4899',
          blue: '#3B82F6',
          teal: '#14B8A6',
          green: '#10B981',
          yellow: '#FBBF24',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        'ibm-plex': ['"IBM Plex Sans"', 'sans-serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        'float-slow': {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '33%': { transform: 'translate(10px, -15px) rotate(5deg)' },
          '66%': { transform: 'translate(-5px, -8px) rotate(-3deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' }
        },
        'float-medium': {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'translate(-8px, -10px) rotate(-5deg)' },
          '50%': { transform: 'translate(5px, -15px) rotate(3deg)' },
          '75%': { transform: 'translate(-3px, -5px) rotate(-2deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' }
        },
        'float-fast': {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '20%': { transform: 'translate(8px, -12px) rotate(4deg)' },
          '40%': { transform: 'translate(-5px, -8px) rotate(-3deg)' },
          '60%': { transform: 'translate(3px, -15px) rotate(2deg)' },
          '80%': { transform: 'translate(-2px, -5px) rotate(-1deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-medium': 'float-medium 6s ease-in-out infinite',
        'float-fast': 'float-fast 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'hover-scale': 'scale 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} 