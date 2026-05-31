export type ThemeDarkMode = 'light' | 'dark' | 'system';
export type ActiveThemeMode = 'light' | 'dark';

export type MaterialPaletteName =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'neutralVariant'
  | 'error';

export type PrimePaletteShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type PrimePalette = Record<PrimePaletteShade, string> & { 0?: string };

export type MaterialThemeRole =
  | 'primary'
  | 'onPrimary'
  | 'primaryContainer'
  | 'onPrimaryContainer'
  | 'primaryFixed'
  | 'primaryFixedDim'
  | 'onPrimaryFixed'
  | 'onPrimaryFixedVariant'
  | 'secondary'
  | 'onSecondary'
  | 'secondaryContainer'
  | 'onSecondaryContainer'
  | 'secondaryFixed'
  | 'secondaryFixedDim'
  | 'onSecondaryFixed'
  | 'onSecondaryFixedVariant'
  | 'tertiary'
  | 'onTertiary'
  | 'tertiaryContainer'
  | 'onTertiaryContainer'
  | 'tertiaryFixed'
  | 'tertiaryFixedDim'
  | 'onTertiaryFixed'
  | 'onTertiaryFixedVariant'
  | 'error'
  | 'onError'
  | 'errorContainer'
  | 'onErrorContainer'
  | 'surface'
  | 'surfaceDim'
  | 'surfaceBright'
  | 'surfaceContainerLowest'
  | 'surfaceContainerLow'
  | 'surfaceContainer'
  | 'surfaceContainerHigh'
  | 'surfaceContainerHighest'
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'outline'
  | 'outlineVariant'
  | 'inverseSurface'
  | 'inverseOnSurface'
  | 'inversePrimary'
  | 'background'
  | 'onBackground'
  | 'surfaceTint'
  | 'shadow'
  | 'scrim';

export type MaterialThemeScheme = Record<MaterialThemeRole, string>;

export type MaterialPrimePalettes = Record<MaterialPaletteName | 'surface', PrimePalette>;

export interface MaterialGeneratedTheme {
  seedColor: string;
  activeMode: ActiveThemeMode;
  isDark: boolean;
  scheme: MaterialThemeScheme;
  lightScheme: MaterialThemeScheme;
  darkScheme: MaterialThemeScheme;
  palettes: Record<MaterialPaletteName, MaterialTonalPalette>;
  primePalettes: MaterialPrimePalettes;
}

export interface MaterialTonalPalette {
  tone(tone: number): string;
}

export interface ThemeState {
  schemaVersion: number;
  seedColor: string;
  darkMode: ThemeDarkMode;
  surfacePreference?: string;
  updatedAt?: string;
}

export interface SeedColorPreset {
  id: string;
  label: string;
  color: string;
}
