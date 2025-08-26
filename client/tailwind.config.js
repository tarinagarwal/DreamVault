/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // DARK THEME CONFIGURATION - Forest Green & Amber Aesthetic
      colors: {
        // Brand Colors - Forest Green Theme
        brand: {
          50: "#f0fdf4", // Very light green
          100: "#dcfce7", // Light green
          200: "#bbf7d0", // Lighter green
          300: "#86efac", // Light green
          400: "#4ade80", // Medium light green
          500: "#22c55e", // Medium green
          600: "#059669", // Main brand color - Deep forest green
          700: "#047857", // Primary hover color - Darker forest
          800: "#065f46", // Dark forest green
          900: "#064e3b", // Very dark forest
          950: "#022c22", // Darkest forest
        },

        // Use Tailwind's default neutral colors, just add custom 750 shade
        neutral: {
          750: "#363636", // Custom shade for hover states
        },

        // Semantic Colors - Adjusted for Dark Theme
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac", // Light success text
          400: "#4ade80", // Success text
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d", // Dark success background
          950: "#052e16", // Darkest success background
        },

        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5", // Light danger text
          400: "#f87171", // Danger text
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d", // Dark danger background
          950: "#450a0a", // Darkest danger background
        },

        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d", // Light warning text
          400: "#f59e0b", // Warning text - Amber accent
          500: "#d97706", // Main warning color
          600: "#c2410c", // Darker amber
          700: "#9a3412", // Dark amber
          800: "#7c2d12",
          900: "#651a07", // Dark warning background
          950: "#431407", // Darkest warning background
        },

        info: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd", // Light info text
          400: "#60a5fa", // Info text
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a", // Dark info background
          950: "#172554", // Darkest info background
        },

        // Additional colors from shadcn/ui
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      },

      // Typography System
      fontFamily: {
        primary: ["Fredoka", "system-ui", "sans-serif"],
        secondary: ["Georgia", "serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      // Spacing System (8px base)
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // Shadow System - Enhanced for Dark Theme
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        large: "0 10px 50px -12px rgba(0, 0, 0, 0.6)",
        glow: "0 0 20px rgba(5, 150, 105, 0.5)", // Forest green glow
        "glow-brand": "0 0 20px rgba(5, 150, 105, 0.3)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)",
      },

      // Border Radius System - Updated for shadcn/ui
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // Animation System
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-out": "fadeOut 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "scale-out": "scaleOut 0.2s ease-out",
        "bounce-soft": "bounceSoft 0.6s ease-in-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        bounceSoft: {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0, -8px, 0)" },
          "70%": { transform: "translate3d(0, -4px, 0)" },
          "90%": { transform: "translate3d(0, -2px, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      // Transition System
      transitionDuration: {
        400: "400ms",
        600: "600ms",
        800: "800ms",
      },

      // Backdrop Effects
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },

      // Gradient Stops for Brand Gradients - Updated for Forest Theme
      gradientColorStops: {
        "brand-gradient": {
          from: "#059669", // brand-600 - Deep forest green
          to: "#047857", // brand-700 - Darker forest
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
