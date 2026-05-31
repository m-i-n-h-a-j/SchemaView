import {
  argbFromHex,
  CorePalette,
  hexFromArgb,
  TonalPalette,
} from '@material/material-color-utilities';
import {
  ActiveThemeMode,
  MaterialGeneratedTheme,
  MaterialPaletteName,
  MaterialPrimePalettes,
  MaterialThemeScheme,
  MaterialTonalPalette,
  PrimePalette,
  PrimePaletteShade,
} from './material-theme.types';
import { DEFAULT_SAFE_SEED_COLOR } from './theme-tokens';

const PRIME_PALETTE_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const satisfies readonly PrimePaletteShade[];

const PRIME_SCALE_TONES = {
  50: 95,
  100: 90,
  200: 80,
  300: 70,
  400: 60,
  500: 50,
  600: 40,
  700: 30,
  800: 20,
  900: 10,
  950: 5,
} satisfies Record<PrimePaletteShade, number>;

const HEX_COLOR_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

type InternalTonalPalettes = Record<MaterialPaletteName, TonalPalette>;

export function normalizeSeedColor(
  seedColor: string | null | undefined,
  fallback = DEFAULT_SAFE_SEED_COLOR,
): string {
  const raw = seedColor?.trim();

  if (!raw || !HEX_COLOR_PATTERN.test(raw)) {
    return fallback;
  }

  const hex = raw.startsWith('#') ? raw.slice(1) : raw;

  if (hex.length === 3) {
    return `#${hex
      .split('')
      .map((part) => `${part}${part}`)
      .join('')}`.toLowerCase();
  }

  return `#${hex}`.toLowerCase();
}

export function isValidSeedColor(seedColor: string | null | undefined): boolean {
  return HEX_COLOR_PATTERN.test(seedColor?.trim() ?? '');
}

export function generateMaterialTheme(
  seedColor: string,
  activeMode: ActiveThemeMode,
): MaterialGeneratedTheme {
  const normalizedSeedColor = normalizeSeedColor(seedColor);
  const corePalette = CorePalette.of(argbFromHex(normalizedSeedColor));
  const palettes = createTonalPalettes(corePalette);
  const lightScheme = createMaterialScheme(palettes, 'light');
  const darkScheme = createMaterialScheme(palettes, 'dark');
  const isDark = activeMode === 'dark';

  return {
    seedColor: normalizedSeedColor,
    activeMode,
    isDark,
    scheme: isDark ? darkScheme : lightScheme,
    lightScheme,
    darkScheme,
    palettes: wrapTonalPalettes(palettes),
    primePalettes: createPrimePalettes(palettes),
  };
}

function createTonalPalettes(corePalette: CorePalette): InternalTonalPalettes {
  return {
    primary: corePalette.a1,
    secondary: corePalette.a2,
    tertiary: corePalette.a3,
    neutral: corePalette.n1,
    neutralVariant: corePalette.n2,
    error: corePalette.error,
  };
}

function wrapTonalPalettes(
  palettes: InternalTonalPalettes,
): Record<MaterialPaletteName, MaterialTonalPalette> {
  return {
    primary: { tone: (toneValue) => tone(palettes.primary, toneValue) },
    secondary: { tone: (toneValue) => tone(palettes.secondary, toneValue) },
    tertiary: { tone: (toneValue) => tone(palettes.tertiary, toneValue) },
    neutral: { tone: (toneValue) => tone(palettes.neutral, toneValue) },
    neutralVariant: { tone: (toneValue) => tone(palettes.neutralVariant, toneValue) },
    error: { tone: (toneValue) => tone(palettes.error, toneValue) },
  };
}

function createMaterialScheme(
  palettes: InternalTonalPalettes,
  mode: ActiveThemeMode,
): MaterialThemeScheme {
  const isDark = mode === 'dark';

  return {
    primary: tone(palettes.primary, isDark ? 80 : 40),
    onPrimary: tone(palettes.primary, isDark ? 20 : 100),
    primaryContainer: tone(palettes.primary, isDark ? 30 : 90),
    onPrimaryContainer: tone(palettes.primary, isDark ? 90 : 10),
    primaryFixed: tone(palettes.primary, 90),
    primaryFixedDim: tone(palettes.primary, 80),
    onPrimaryFixed: tone(palettes.primary, 10),
    onPrimaryFixedVariant: tone(palettes.primary, 30),

    secondary: tone(palettes.secondary, isDark ? 80 : 40),
    onSecondary: tone(palettes.secondary, isDark ? 20 : 100),
    secondaryContainer: tone(palettes.secondary, isDark ? 30 : 90),
    onSecondaryContainer: tone(palettes.secondary, isDark ? 90 : 10),
    secondaryFixed: tone(palettes.secondary, 90),
    secondaryFixedDim: tone(palettes.secondary, 80),
    onSecondaryFixed: tone(palettes.secondary, 10),
    onSecondaryFixedVariant: tone(palettes.secondary, 30),

    tertiary: tone(palettes.tertiary, isDark ? 80 : 40),
    onTertiary: tone(palettes.tertiary, isDark ? 20 : 100),
    tertiaryContainer: tone(palettes.tertiary, isDark ? 30 : 90),
    onTertiaryContainer: tone(palettes.tertiary, isDark ? 90 : 10),
    tertiaryFixed: tone(palettes.tertiary, 90),
    tertiaryFixedDim: tone(palettes.tertiary, 80),
    onTertiaryFixed: tone(palettes.tertiary, 10),
    onTertiaryFixedVariant: tone(palettes.tertiary, 30),

    error: tone(palettes.error, isDark ? 80 : 40),
    onError: tone(palettes.error, isDark ? 20 : 100),
    errorContainer: tone(palettes.error, isDark ? 30 : 90),
    onErrorContainer: tone(palettes.error, isDark ? 90 : 10),

    surface: tone(palettes.neutral, isDark ? 6 : 98),
    surfaceDim: tone(palettes.neutral, isDark ? 6 : 87),
    surfaceBright: tone(palettes.neutral, isDark ? 24 : 98),
    surfaceContainerLowest: tone(palettes.neutral, isDark ? 4 : 100),
    surfaceContainerLow: tone(palettes.neutral, isDark ? 10 : 96),
    surfaceContainer: tone(palettes.neutral, isDark ? 12 : 94),
    surfaceContainerHigh: tone(palettes.neutral, isDark ? 17 : 92),
    surfaceContainerHighest: tone(palettes.neutral, isDark ? 22 : 90),

    onSurface: tone(palettes.neutral, isDark ? 90 : 10),
    onSurfaceVariant: tone(palettes.neutralVariant, isDark ? 80 : 30),
    outline: tone(palettes.neutralVariant, isDark ? 60 : 50),
    outlineVariant: tone(palettes.neutralVariant, isDark ? 30 : 80),

    inverseSurface: tone(palettes.neutral, isDark ? 90 : 20),
    inverseOnSurface: tone(palettes.neutral, isDark ? 20 : 95),
    inversePrimary: tone(palettes.primary, isDark ? 40 : 80),

    background: tone(palettes.neutral, isDark ? 6 : 98),
    onBackground: tone(palettes.neutral, isDark ? 90 : 10),
    surfaceTint: tone(palettes.primary, isDark ? 80 : 40),
    shadow: tone(palettes.neutral, 0),
    scrim: tone(palettes.neutral, 0),
  };
}

function createPrimePalettes(palettes: InternalTonalPalettes): MaterialPrimePalettes {
  return {
    primary: tonalPaletteToPrimeScale(palettes.primary),
    secondary: tonalPaletteToPrimeScale(palettes.secondary),
    tertiary: tonalPaletteToPrimeScale(palettes.tertiary),
    neutral: tonalPaletteToPrimeScale(palettes.neutral, true),
    neutralVariant: tonalPaletteToPrimeScale(palettes.neutralVariant),
    error: tonalPaletteToPrimeScale(palettes.error),
    surface: tonalPaletteToPrimeScale(palettes.neutral, true),
  };
}

export function tonalPaletteToPrimeScale(
  palette: TonalPalette,
  includeSurfaceZero = false,
): PrimePalette {
  const scale = {} as PrimePalette;

  if (includeSurfaceZero) {
    scale[0] = tone(palette, 100);
  }

  for (const shade of PRIME_PALETTE_SHADES) {
    scale[shade] = tone(palette, PRIME_SCALE_TONES[shade]);
  }

  return scale;
}

function tone(palette: TonalPalette, toneValue: number): string {
  return hexFromArgb(palette.tone(toneValue)).toLowerCase();
}
