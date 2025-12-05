import type {Config} from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Rethink Sans', 'ui-sans-serif', 'sans-serif', 'system-ui'],
        serif: ['Georgia', 'serif'],
        mono: ['Menlo', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
          accent: {
            DEFAULT: 'hsl(var(--sidebar-accent))',
            foreground: 'hsl(var(--sidebar-accent-foreground))',
          }
        },
      },
      borderRadius: {
        base: '0.775rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
       typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-lead': 'hsl(var(--foreground))',
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-hr': 'hsl(var(--border))',
            '--tw-prose-quotes': 'hsl(var(--foreground))',
            '--tw-prose-quote-borders': 'hsl(var(--border))',
            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-bg': 'hsl(var(--muted))',
            '--tw-prose-invert-body': 'hsl(var(--background))',
            '--tw-prose-invert-headings': 'hsl(var(--primary))',
            '--tw-prose-invert-lead': 'hsl(var(--background))',
            '--tw-prose-invert-links': 'hsl(var(--primary))',
            '--tw-prose-invert-bold': 'hsl(var(--background))',
            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-hr': 'hsl(var(--border))',
            '--tw-prose-invert-quotes': 'hsl(var(--background))',
            '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-code': 'hsl(var(--background))',
            '--tw-prose-invert-pre-code': 'hsl(var(--background))',
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': 'hsl(var(--border))',
            '--tw-prose-invert-td-borders': 'hsl(var(--border))',
          },
        },
      }),
      keyframes: {
        'accordion-down': {
          from: {height: '0'},
          to: {height: 'var(--radix-accordion-content-height)'},
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
