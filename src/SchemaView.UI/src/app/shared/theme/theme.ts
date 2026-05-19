import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/aura';

export type SchemaViewThemeShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type SchemaViewThemePalette = Record<SchemaViewThemeShade, string>;

export const SCHEMAVIEW_PRIMARY_COLORS = ['blue', 'fuchsia', 'green', 'red'] as const;
export type SchemaViewPrimaryColor = (typeof SCHEMAVIEW_PRIMARY_COLORS)[number];

export const SCHEMAVIEW_PRIMARY_PALETTES = {
  blue: {
    50: '#eef5ff',
    100: '#d9e9ff',
    200: '#b5d4ff',
    300: '#85b6ff',
    400: '#4d8cff',
    500: '#003197',
    600: '#002b83',
    700: '#00246e',
    800: '#061f58',
    900: '#081a45',
    950: '#04112f',
  },
  fuchsia: {
    50: '#f7f2ff',
    100: '#eee4ff',
    200: '#ddccff',
    300: '#c4a6ff',
    400: '#a577ff',
    500: '#7c3aed',
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3b1778',
    950: '#211044',
  },
  green: {
    50: '#ecfdf9',
    100: '#cffaf0',
    200: '#a3f2df',
    300: '#67e4c8',
    400: '#2ac7aa',
    500: '#0f766e',
    600: '#0b655f',
    700: '#0a554f',
    800: '#0b4541',
    900: '#0a3835',
    950: '#04211f',
  },
  red: {
    50: '#fff1f1',
    100: '#ffe1e1',
    200: '#ffc8c8',
    300: '#ffa2a2',
    400: '#fb6b6b',
    500: '#dc2626',
    600: '#bd1f1f',
    700: '#9f1d1d',
    800: '#841f1f',
    900: '#6e2020',
    950: '#3b0d0d',
  },
} satisfies Record<SchemaViewPrimaryColor, SchemaViewThemePalette>;

export const SCHEMAVIEW_PRIMARY_COLOR_SCHEME = {
  light: {
    primary: {
      color: '{primary.500}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.600}',
      activeColor: '{primary.700}',
    },
    highlight: {
      background: '{primary.50}',
      focusBackground: '{primary.100}',
      color: '{primary.700}',
      focusColor: '{primary.800}',
    },
  },
  dark: {
    primary: {
      color: '{primary.300}',
      contrastColor: '{primary.950}',
      hoverColor: '{primary.200}',
      activeColor: '{primary.100}',
    },
    highlight: {
      background: '{primary.900}',
      focusBackground: '{primary.800}',
      color: '{primary.100}',
      focusColor: '{primary.50}',
    },
  },
} as const;

export const SchemaViewDefaultPreset = definePreset(Lara, {
  semantic: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },

    primary: SCHEMAVIEW_PRIMARY_PALETTES.blue,
    colorScheme: SCHEMAVIEW_PRIMARY_COLOR_SCHEME,
  },
});
