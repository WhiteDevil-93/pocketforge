/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PocketForge Design Tokens — sourced from the CSS custom properties in
        // src/index.css (not hard-coded here) so a [data-theme="light"] override
        // block there can actually change what these classes render as. Each var
        // holds space-separated RGB components (e.g. "59 130 246", not "#3B82F6"
        // or "rgb(59 130 246)") specifically so the rgb(var(--x) / <alpha-value>)
        // form below lets Tailwind's opacity-modifier syntax work
        // (bg-accent-primary/10 and the many other /NN usages throughout this
        // app) — a bare var(--x) reference silently drops those modifier
        // classes at build time instead of erroring, which is what happened
        // here until this was caught by diffing the compiled CSS.
        'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
        'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
        'border-active': 'rgb(var(--border-active) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
        'accent-primary': 'rgb(var(--accent-primary) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--accent-secondary) / <alpha-value>)',
        'success': 'rgb(var(--success) / <alpha-value>)',
        'warning': 'rgb(var(--warning) / <alpha-value>)',
        'danger': 'rgb(var(--danger) / <alpha-value>)',
        // Type Colors (18 types)
        'type-normal': '#A8A77A',
        'type-fire': '#EE8130',
        'type-water': '#6390F0',
        'type-electric': '#F7D02C',
        'type-grass': '#7AC74C',
        'type-ice': '#96D9D6',
        'type-fighting': '#C22E28',
        'type-poison': '#A33EA1',
        'type-ground': '#E2BF65',
        'type-flying': '#A98FF3',
        'type-psychic': '#F95587',
        'type-bug': '#A6B91A',
        'type-rock': '#B6A136',
        'type-ghost': '#735797',
        'type-dragon': '#6F35FC',
        'type-dark': '#705746',
        'type-steel': '#B7B7CE',
        'type-fairy': '#D685AD',
        // Stat Colors
        'stat-hp': '#FF4444',
        'stat-atk': '#F08030',
        'stat-def': '#F8D030',
        'stat-spa': '#6890F0',
        'stat-spd': '#78C850',
        'stat-spe': '#F85888',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
        'space-grotesk': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-8': '32px',
        'space-10': '40px',
        'space-16': '64px',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        'card': '16px',
        'card-md': '12px',
        'badge': '8px',
        'sheet': '24px',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'card': '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        'fab': '0 4px 16px rgba(59, 130, 246, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
