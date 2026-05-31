import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { updatePreset } from '@primeuix/themes';
import { ThemeState } from '../../shared/models/interfaces/theme-state';
import { applyMaterialThemeToDom } from '../../shared/theme/material-theme.dom';
import {
  generateMaterialTheme,
  normalizeSeedColor,
} from '../../shared/theme/material-theme.generator';
import {
  ActiveThemeMode,
  MaterialGeneratedTheme,
  PrimePaletteShade,
  SeedColorPreset,
  ThemeDarkMode,
} from '../../shared/theme/material-theme.types';
import {
  createPrimeNgThemePreset,
  DEFAULT_SAFE_SEED_COLOR,
  MATERIAL_SEED_PRESETS,
  MATERIAL_THEME_SCHEMA_VERSION,
} from '../../shared/theme/theme-tokens';
import { persistThemeState, readThemeState } from '../../shared/theme/theme-storage';

const PRIME_NG_PRESET_UPDATE_DEBOUNCE_MS = 120;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = getBrowserStorage();
  private readonly mediaQuery = getSystemDarkModeMediaQuery();
  private readonly systemPrefersDark = signal(this.mediaQuery?.matches ?? false);
  private systemThemeListenerRegistered = false;
  private primeNgUpdateHandle: ReturnType<typeof setTimeout> | null = null;

  readonly seedColorPresets: readonly SeedColorPreset[] = MATERIAL_SEED_PRESETS;
  readonly colors = this.seedColorPresets.map((preset) => preset.id);

  readonly themeState = signal<ThemeState>(readThemeState(this.storage));

  readonly activeMode = computed<ActiveThemeMode>(() => {
    const mode = this.themeState().darkMode;

    if (mode === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }

    return mode;
  });

  readonly materialTheme = computed(() =>
    this.safeGenerateTheme(this.themeState().seedColor, this.activeMode()),
  );

  readonly activeRoles = computed(() => this.materialTheme().scheme);
  readonly activePrimePalettes = computed(() => this.materialTheme().primePalettes);
  readonly isDarkMode = computed(() => this.activeMode() === 'dark');

  constructor() {
    effect(() => {
      if (this.themeState().darkMode === 'system') {
        this.listenToSystemThemeChanges();
      } else {
        this.removeSystemThemeListener();
      }
    });

    effect(() => {
      const theme = this.materialTheme();

      this.applyGeneratedTheme(theme);
      persistThemeState(this.storage, this.themeState());
    });
  }

  initTheme(): void {
    this.syncSystemPreference();
    this.applyGeneratedTheme(this.materialTheme(), true);
  }

  initColorPallete(): void {
    this.applyGeneratedTheme(this.materialTheme(), true);
  }

  applySeedColor(seedColor: string): void {
    const normalizedSeedColor = normalizeSeedColor(this.resolveSeedColorInput(seedColor));

    this.themeState.update((state) => {
      if (state.seedColor === normalizedSeedColor) {
        return state;
      }

      return {
        ...state,
        schemaVersion: MATERIAL_THEME_SCHEMA_VERSION,
        seedColor: normalizedSeedColor,
      };
    });
  }

  updatePrimary(color: string): void {
    this.applySeedColor(color);
  }

  getPrimaryColor(color: string, shade: PrimePaletteShade = 500): string {
    const seedColor = normalizeSeedColor(this.resolveSeedColorInput(color));

    return this.safeGenerateTheme(seedColor, 'light').primePalettes.primary[shade];
  }

  setLight(): void {
    this.setDarkMode('light');
  }

  setDark(): void {
    this.setDarkMode('dark');
  }

  applySystemDarkMode(): void {
    this.syncSystemPreference();
    this.setDarkMode('system');
  }

  toggleTheme(): void {
    if (this.isDark()) {
      this.setLight();
    } else {
      this.setDark();
    }
  }

  isDark(): boolean {
    return this.isDarkMode();
  }

  listenToSystemThemeChanges(): void {
    if (!this.mediaQuery || this.systemThemeListenerRegistered) {
      return;
    }

    this.mediaQuery.addEventListener('change', this.systemThemeListener);
    this.systemThemeListenerRegistered = true;
  }

  removeSystemThemeListener(): void {
    if (!this.mediaQuery || !this.systemThemeListenerRegistered) {
      return;
    }

    this.mediaQuery.removeEventListener('change', this.systemThemeListener);
    this.systemThemeListenerRegistered = false;
  }

  private readonly systemThemeListener = (event: MediaQueryListEvent): void => {
    this.systemPrefersDark.set(event.matches);
  };

  private setDarkMode(darkMode: ThemeDarkMode): void {
    this.themeState.update((state) => {
      if (state.darkMode === darkMode) {
        return state;
      }

      return {
        ...state,
        schemaVersion: MATERIAL_THEME_SCHEMA_VERSION,
        darkMode,
      };
    });
  }

  private syncSystemPreference(): void {
    this.systemPrefersDark.set(this.mediaQuery?.matches ?? false);
  }

  private resolveSeedColorInput(seedColor: string): string {
    const normalized = seedColor.trim().toLowerCase();
    const preset = this.seedColorPresets.find(
      (item) => item.id === normalized || item.label.toLowerCase() === normalized,
    );

    return preset?.color ?? seedColor;
  }

  private safeGenerateTheme(seedColor: string, activeMode: ActiveThemeMode) {
    try {
      return generateMaterialTheme(seedColor, activeMode);
    } catch {
      return generateMaterialTheme(DEFAULT_SAFE_SEED_COLOR, activeMode);
    }
  }

  private applyGeneratedTheme(theme = this.materialTheme(), immediate = false): void {
    // Writing the Material CSS variables is cheap and drives the live role
    // preview and Tailwind colors, so do it on every change for instant feedback.
    this.applyThemeCssVariables(theme);

    // updatePreset() deep-merges the full Aura + Material preset, rebuilds the
    // entire PrimeNG token graph and restyles every mounted component. That is
    // far too expensive to run on every color-picker `input` event, so debounce
    // it to run once after the user settles (it froze/crashed the tab otherwise).
    this.cancelScheduledPrimeNgUpdate();

    if (immediate) {
      this.updatePrimeNgPreset(theme);
      return;
    }

    this.primeNgUpdateHandle = setTimeout(() => {
      this.primeNgUpdateHandle = null;
      this.updatePrimeNgPreset(theme);
    }, PRIME_NG_PRESET_UPDATE_DEBOUNCE_MS);
  }

  private cancelScheduledPrimeNgUpdate(): void {
    if (this.primeNgUpdateHandle !== null) {
      clearTimeout(this.primeNgUpdateHandle);
      this.primeNgUpdateHandle = null;
    }
  }

  private applyThemeCssVariables(theme: MaterialGeneratedTheme): void {
    const root = this.document.documentElement;

    try {
      applyMaterialThemeToDom(root, theme);
    } catch {
      applyMaterialThemeToDom(root, this.fallbackTheme());
    }
  }

  // Note: the preset already carries the surface palette via
  // colorScheme.{light,dark}.surface, so a separate updateSurfacePalette() call
  // would only duplicate this full rebuild.
  private updatePrimeNgPreset(theme: MaterialGeneratedTheme): void {
    try {
      updatePreset(createPrimeNgThemePreset(theme));
    } catch {
      updatePreset(createPrimeNgThemePreset(this.fallbackTheme()));
    }
  }

  private fallbackTheme(): MaterialGeneratedTheme {
    return generateMaterialTheme(DEFAULT_SAFE_SEED_COLOR, this.activeMode());
  }
}

function getBrowserStorage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function getSystemDarkModeMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  return window.matchMedia('(prefers-color-scheme: dark)');
}
