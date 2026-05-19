/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Base
        bg: {
          primary:   '#080C14',
          secondary: '#0D1526',
          tertiary:  '#111827',
          card:      '#0E1829',
          hover:     '#162035',
          border:    '#1E2D47',
          'border-light': '#263654',
        },
        // Brand
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Accent
        accent: {
          cyan:   '#22d3ee',
          amber:  '#f59e0b',
          rose:   '#f43f5e',
          emerald:'#10b981',
          purple: '#a855f7',
        },
        // Text
        text: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          muted:     '#64748b',
          disabled:  '#334155',
        },
        // Platform colors
        instagram: '#E1306C',
        facebook:  '#1877F2',
        twitter:   '#1DA1F2',
        youtube:   '#FF0000',
        linkedin:  '#0A66C2',
        threads:   '#101010',
        sharechat: '#F58020',
        moj:       '#FF2D55',
        pinterest: '#E60023',
        telegram:  '#2AABEE',
        whatsapp:  '#25D366',
        snapchat:  '#FFFC00',
      },
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(14,24,41,0.9) 0%, rgba(11,17,30,0.95) 100%)',
        'gradient-glow':     'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'gradient-sidebar':  'linear-gradient(180deg, #0A1020 0%, #080C14 100%)',
        'noise':             "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,45,71,0.6)',
        'glow':    '0 0 30px rgba(99,102,241,0.25)',
        'glow-sm': '0 0 15px rgba(99,102,241,0.2)',
        'inner':   'inset 0 1px 0 rgba(255,255,255,0.05)',
        'float':   '0 20px 60px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':      'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:     { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        float:       { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
