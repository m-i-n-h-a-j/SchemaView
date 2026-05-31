import type { PaletteDesignToken, Preset } from '@primeuix/themes/types';
import type {
  MaterialGeneratedTheme,
  MaterialThemeScheme,
  SeedColorPreset,
} from './material-theme.types';

export const MATERIAL_THEME_STORAGE_KEY = 'theme-state';
export const MATERIAL_THEME_SCHEMA_VERSION = 2;
export const DEFAULT_SAFE_SEED_COLOR = '#003197';

export const MATERIAL_SEED_PRESETS = [
  { id: 'kinexa-blue', label: 'Kinexa Blue', color: DEFAULT_SAFE_SEED_COLOR },
  { id: 'violet', label: 'Violet', color: '#6750a4' },
  { id: 'teal', label: 'Teal', color: '#0f766e' },
  { id: 'rose', label: 'Rose', color: '#dc2626' },
  { id: 'fuchsia', label: 'Fuchsia', color: '#7c3aed' },
  { id: 'amber', label: 'Amber', color: '#b45309' },
] as const satisfies readonly SeedColorPreset[];

const BORDER_RADIUS = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
};

export function createPrimeNgThemePreset(theme: MaterialGeneratedTheme): Preset {
  return {
    semantic: {
      borderRadius: BORDER_RADIUS,
      primary: theme.primePalettes.primary,
      secondary: theme.primePalettes.secondary,
      tertiary: theme.primePalettes.tertiary,
      error: theme.primePalettes.error,
      colorScheme: {
        light: createPrimeNgColorScheme(
          theme.lightScheme,
          theme.primePalettes.primary,
          theme.primePalettes.secondary,
          theme.primePalettes.tertiary,
          theme.primePalettes.surface,
          false,
        ),
        dark: createPrimeNgColorScheme(
          theme.darkScheme,
          theme.primePalettes.primary,
          theme.primePalettes.secondary,
          theme.primePalettes.tertiary,
          theme.primePalettes.surface,
          true,
        ),
      },
    },
  };
}

function createPrimeNgColorScheme(
  scheme: MaterialThemeScheme,
  primaryPalette: PaletteDesignToken,
  secondaryPalette: PaletteDesignToken,
  tertiaryPalette: PaletteDesignToken,
  surfacePalette: PaletteDesignToken,
  isDark: boolean,
) {
  return {
    surface: surfacePalette,
    primary: primeInteractiveRole(scheme.primary, scheme.onPrimary, primaryPalette, isDark),
    secondary: primeInteractiveRole(scheme.secondary, scheme.onSecondary, secondaryPalette, isDark),
    tertiary: primeInteractiveRole(scheme.tertiary, scheme.onTertiary, tertiaryPalette, isDark),
    highlight: {
      background: scheme.primaryContainer,
      focusBackground: scheme.primaryFixedDim,
      color: scheme.onPrimaryContainer,
      focusColor: scheme.onPrimaryFixed,
    },
    mask: {
      background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
      color: scheme.inverseOnSurface,
    },
    formField: {
      background: scheme.surfaceContainerLowest,
      disabledBackground: scheme.surfaceContainer,
      filledBackground: scheme.surfaceContainerLow,
      filledHoverBackground: scheme.surfaceContainer,
      filledFocusBackground: scheme.surfaceContainer,
      borderColor: scheme.outlineVariant,
      hoverBorderColor: scheme.outline,
      focusBorderColor: scheme.primary,
      invalidBorderColor: scheme.error,
      color: scheme.onSurface,
      disabledColor: scheme.onSurfaceVariant,
      placeholderColor: scheme.onSurfaceVariant,
      invalidPlaceholderColor: scheme.error,
      floatLabelColor: scheme.onSurfaceVariant,
      floatLabelFocusColor: scheme.primary,
      floatLabelActiveColor: scheme.onSurfaceVariant,
      floatLabelInvalidColor: scheme.error,
      iconColor: scheme.onSurfaceVariant,
      shadow: 'none',
    },
    text: {
      color: scheme.onSurface,
      hoverColor: scheme.onSurface,
      mutedColor: scheme.onSurfaceVariant,
      hoverMutedColor: scheme.onSurfaceVariant,
    },
    content: {
      background: scheme.surfaceContainerLow,
      hoverBackground: scheme.surfaceContainer,
      borderColor: scheme.outlineVariant,
      color: scheme.onSurface,
      hoverColor: scheme.onSurface,
    },
    overlay: {
      select: {
        background: scheme.surfaceContainerLow,
        borderColor: scheme.outlineVariant,
        color: scheme.onSurface,
      },
      popover: {
        background: scheme.surfaceContainerLow,
        borderColor: scheme.outlineVariant,
        color: scheme.onSurface,
      },
      modal: {
        background: scheme.surfaceContainerLow,
        borderColor: scheme.outlineVariant,
        color: scheme.onSurface,
      },
    },
    list: {
      option: {
        focusBackground: scheme.surfaceContainer,
        selectedBackground: scheme.primaryContainer,
        selectedFocusBackground: scheme.primaryFixedDim,
        color: scheme.onSurface,
        focusColor: scheme.onSurface,
        selectedColor: scheme.onPrimaryContainer,
        selectedFocusColor: scheme.onPrimaryFixed,
        icon: {
          color: scheme.onSurfaceVariant,
          focusColor: scheme.onSurfaceVariant,
        },
      },
      optionGroup: {
        background: 'transparent',
        color: scheme.onSurfaceVariant,
      },
    },
    navigation: {
      item: {
        focusBackground: scheme.surfaceContainer,
        activeBackground: scheme.secondaryContainer,
        color: scheme.onSurfaceVariant,
        focusColor: scheme.onSurface,
        activeColor: scheme.onSecondaryContainer,
        icon: {
          color: scheme.onSurfaceVariant,
          focusColor: scheme.onSurface,
          activeColor: scheme.onSecondaryContainer,
        },
      },
      submenuLabel: {
        background: 'transparent',
        color: scheme.onSurfaceVariant,
      },
      submenuIcon: {
        color: scheme.onSurfaceVariant,
        focusColor: scheme.onSurface,
        activeColor: scheme.onSecondaryContainer,
      },
    },
  };
}

function primeInteractiveRole(
  color: string,
  contrastColor: string,
  palette: PaletteDesignToken,
  isDark: boolean,
) {
  return {
    color,
    contrastColor,
    hoverColor: isDark ? palette[100] : palette[700],
    activeColor: isDark ? palette[50] : palette[800],
  };
}
