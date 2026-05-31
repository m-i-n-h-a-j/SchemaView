import { ThemeDarkMode, ThemeState } from './material-theme.types';
import { normalizeSeedColor } from './material-theme.generator';
import {
  DEFAULT_SAFE_SEED_COLOR,
  MATERIAL_SEED_PRESETS,
  MATERIAL_THEME_SCHEMA_VERSION,
  MATERIAL_THEME_STORAGE_KEY,
} from './theme-tokens';

const LEGACY_PRIMARY_PRESET_IDS = new Map<string, string>([
  ['blue', 'kinexa-blue'],
  ['green', 'teal'],
  ['red', 'rose'],
  ['fuchsia', 'fuchsia'],
]);

export function createDefaultThemeState(): ThemeState {
  return {
    schemaVersion: MATERIAL_THEME_SCHEMA_VERSION,
    seedColor: DEFAULT_SAFE_SEED_COLOR,
    darkMode: 'system',
  };
}

export function readThemeState(storage: Storage | null | undefined): ThemeState {
  const defaultState = createDefaultThemeState();

  if (!storage) {
    return defaultState;
  }

  try {
    const saved = storage.getItem(MATERIAL_THEME_STORAGE_KEY);

    if (!saved) {
      return defaultState;
    }

    return normalizeThemeState(JSON.parse(saved), defaultState);
  } catch {
    return defaultState;
  }
}

export function persistThemeState(storage: Storage | null | undefined, state: ThemeState): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      MATERIAL_THEME_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: MATERIAL_THEME_SCHEMA_VERSION,
        seedColor: normalizeSeedColor(state.seedColor),
        darkMode: state.darkMode,
        surfacePreference: state.surfacePreference,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Persistence is best-effort; rendering must not depend on storage.
  }
}

function normalizeThemeState(value: unknown, defaultState: ThemeState): ThemeState {
  if (!isRecord(value)) {
    return defaultState;
  }

  return {
    schemaVersion: MATERIAL_THEME_SCHEMA_VERSION,
    seedColor: normalizeSeedColor(resolveSeedColor(value), defaultState.seedColor),
    darkMode: isThemeDarkMode(value['darkMode']) ? value['darkMode'] : defaultState.darkMode,
    surfacePreference:
      typeof value['surfacePreference'] === 'string' ? value['surfacePreference'] : undefined,
  };
}

function resolveSeedColor(value: Record<string, unknown>): string {
  if (typeof value['seedColor'] === 'string') {
    return value['seedColor'];
  }

  if (typeof value['primary'] === 'string') {
    const presetId = LEGACY_PRIMARY_PRESET_IDS.get(value['primary'].toLowerCase());
    const preset = MATERIAL_SEED_PRESETS.find((item) => item.id === presetId);

    if (preset) {
      return preset.color;
    }
  }

  return DEFAULT_SAFE_SEED_COLOR;
}

function isThemeDarkMode(value: unknown): value is ThemeDarkMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
