
tailwind.config = {
  // Configuración del modo oscuro
  darkMode: "class",

  theme: {
    extend: {
      // 1. PALETA DE COLORES
      colors: {
        // Colores principales
        primary: "#8f000d",
        secondary: "#8a5100",
        tertiary: "#2c4c2c",
        error: "#ba1a1a",

        // Contenedores principales
        "primary-container": "#b22222",
        "secondary-container": "#fda137",
        "tertiary-container": "#436442",
        "error-container": "#ffdad6",

        // Superficies
        surface: "#fff8f5",
        background: "#fff8f5",
        "surface-bright": "#fff8f5",
        "surface-dim": "#e4d8cf",
        "surface-variant": "#ede0d8",
        "surface-tint": "#b52424",
        "surface-container": "#f9ebe3",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fef1e8",
        "surface-container-high": "#f3e6dd",
        "surface-container-highest": "#ede0d8",

        // Colores de texto e iconos
        "on-primary": "#ffffff",
        "on-primary-container": "#ffc8c2",
        "on-primary-fixed": "#410003",
        "on-primary-fixed-variant": "#92030f",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#6a3c00",
        "on-secondary-fixed": "#2c1600",
        "on-secondary-fixed-variant": "#693c00",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#badfb4",
        "on-tertiary-fixed": "#022106",
        "on-tertiary-fixed-variant": "#2e4e2e",
        "on-surface": "#201a15",
        "on-surface-variant": "#5a403e",
        "on-background": "#201a15",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "inverse-surface": "#362f29",
        "inverse-on-surface": "#fceee6",
        "inverse-primary": "#ffb4ac",

        // Colores fijos
        "primary-fixed": "#ffdad6",
        "primary-fixed-dim": "#ffb4ac",
        "secondary-fixed": "#ffdcbe",
        "secondary-fixed-dim": "#ffb86f",
        "tertiary-fixed": "#c7edc1",
        "tertiary-fixed-dim": "#abd0a6",

        // Contornos
        outline: "#8e706d",
        "outline-variant": "#e2beba",
      },

      // 2. BORDES Y REDONDEADOS
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px",
      },

      // 3. ESPACIADOS PERSONALIZADOS
      spacing: {
        "space-xl": "2.5rem",
        "space-lg": "1.5rem",
        "space-md": "1rem",
        "space-sm": "0.5rem",
        "space-xs": "0.25rem",

        margin: "3rem",
        "margin-tablet": "2rem",
        "margin-mobile": "1.25rem",

        gutter: "1.5rem",
        "gutter-mobile": "1rem",
      },

      // 4. FAMILIAS TIPOGRÁFICAS
      fontFamily: {
        "body-sm": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],

        "label-sm": ["Plus Jakarta Sans"],
        "label-md": ["Plus Jakarta Sans"],
        "label-lg": ["Plus Jakarta Sans"],

        "headline-sm": ["Noto Serif"],
        "headline-md": ["Noto Serif"],
        "headline-lg": ["Noto Serif"],
        "headline-lg-mobile": ["Noto Serif"],

        display: ["Noto Serif"],
        "display-mobile": ["Noto Serif"],
      },

      // 5. TAMAÑOS Y ESTILOS DE TEXTO
      fontSize: {
        "body-sm": [
          "0.875rem",
          {
            lineHeight: "1.5",
            letterSpacing: "0.005em",
            fontWeight: "400",
          },
        ],

        "body-md": [
          "1rem",
          {
            lineHeight: "1.55",
            letterSpacing: "0em",
            fontWeight: "400",
          },
        ],

        "body-lg": [
          "1.125rem",
          {
            lineHeight: "1.6",
            letterSpacing: "0em",
            fontWeight: "400",
          },
        ],

        "label-sm": [
          "0.6875rem",
          {
            lineHeight: "1.15",
            letterSpacing: "0.06em",
            fontWeight: "600",
          },
        ],

        "label-md": [
          "0.75rem",
          {
            lineHeight: "1.2",
            letterSpacing: "0.04em",
            fontWeight: "600",
          },
        ],

        "label-lg": [
          "0.875rem",
          {
            lineHeight: "1.2",
            letterSpacing: "0.02em",
            fontWeight: "600",
          },
        ],

        "headline-sm": [
          "1.25rem",
          {
            lineHeight: "1.35",
            letterSpacing: "0em",
            fontWeight: "600",
          },
        ],

        "headline-md": [
          "1.75rem",
          {
            lineHeight: "1.3",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],

        "headline-lg-mobile": [
          "1.75rem",
          {
            lineHeight: "1.25",
            letterSpacing: "-0.01em",
            fontWeight: "600",
          },
        ],

        "headline-lg": [
          "2.5rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.015em",
            fontWeight: "600",
          },
        ],

        "display-mobile": [
          "2.25rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.01em",
            fontWeight: "600",
          },
        ],

        display: [
          "3.5rem",
          {
            lineHeight: "1.15",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],
      },
    },
  },
};
