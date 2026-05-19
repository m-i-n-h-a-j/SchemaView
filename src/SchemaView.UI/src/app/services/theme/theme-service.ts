import { effect, Injectable, signal } from '@angular/core';
import { updatePreset, updateSurfacePalette } from '@primeuix/themes';
import Lara from '@primeuix/themes/aura';
import { PrimeColor, SurfaceColor } from '../../shared/models/types/primeng';
import {
  KINEXA_PRIMARY_COLOR_SCHEME,
  KINEXA_PRIMARY_COLORS,
  KINEXA_PRIMARY_PALETTES,
  KinexaPrimaryColor,
  KinexaThemeShade,
} from '../../shared/theme/theme';
import { ThemeState } from '../../shared/models/interfaces/theme-state';

const THEME_STORAGE_KEY = 'theme-state';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themeState = signal<ThemeState>(this.loadInitialThemeState());

  constructor() {
    effect(() => {
      const state = this.themeState();

      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
    });
  }

  private loadInitialThemeState(): ThemeState {
    const defaultState: ThemeState = {
      primary: 'blue',
      surface: undefined,
      secondary: undefined,
      tertiary: undefined,
      darkMode: 'system',
    };

    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);

      if (!saved) {
        return defaultState;
      }

      return {
        ...defaultState,
        ...JSON.parse(saved),
      };
    } catch {
      return defaultState;
    }
  }

  colors = [...KINEXA_PRIMARY_COLORS];

  themePresets = {
    green: {
      primary: 'green',
      secondary: 'teal',
      tertiary: 'lime',
      surface: 'zinc',
    },

    red: {
      primary: 'red',
      secondary: 'orange',
      tertiary: 'rose',
      surface: 'stone',
    },

    blue: {
      primary: 'blue',
      secondary: 'cyan',
      tertiary: 'indigo',
      surface: 'slate',
    },

    fuchsia: {
      primary: 'fuchsia',
      secondary: 'purple',
      tertiary: 'pink',
      surface: 'neutral',
    },
  } as const;

  surfaces = {
    slate: {
      0: '#ffffff',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    gray: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    zinc: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    stone: {
      0: '#ffffff',
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09',
    },
    soho: {
      0: '#ffffff',
      50: '#ececec',
      100: '#dedfdf',
      200: '#c4c4c6',
      300: '#adaeb0',
      400: '#97979b',
      500: '#7f8084',
      600: '#6a6b70',
      700: '#55565b',
      800: '#3f4046',
      900: '#2c2c34',
      950: '#16161d',
    },
    viva: {
      0: '#ffffff',
      50: '#f3f3f3',
      100: '#e7e7e8',
      200: '#cfd0d0',
      300: '#b7b8b9',
      400: '#9fa1a1',
      500: '#87898a',
      600: '#6e7173',
      700: '#565a5b',
      800: '#3e4244',
      900: '#262b2c',
      950: '#0e1315',
    },
    ocean: {
      0: '#ffffff',
      50: '#fbfcfc',
      100: '#F7F9F8',
      200: '#EFF3F2',
      300: '#DADEDD',
      400: '#B1B7B6',
      500: '#828787',
      600: '#5F7274',
      700: '#415B61',
      800: '#29444E',
      900: '#183240',
      950: '#0c1920',
    },
  } satisfies Record<SurfaceColor, Record<string, string>>;

  applySystemDarkMode() {
    this.themeState.update((state) => ({
      ...state,
      darkMode: 'system',
    }));

    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    if (mq.matches == true) {
      document.documentElement.classList.add('dark-selector');
      updateSurfacePalette(this.surfaces['neutral']);
    } else {
      document.documentElement.classList.remove('dark-selector');
    }

    this.listenToSystemThemeChanges();
  }

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  private systemThemeListener = (e: MediaQueryListEvent) => {
    if (this.themeState().darkMode === 'system') {
      console.log(e.matches);

      if (e.matches) {
        document.documentElement.classList.add('dark-selector');
        updateSurfacePalette(this.surfaces['neutral']);
      } else {
        document.documentElement.classList.remove('dark-selector');
      }
    }
  };

  private isListeningToSystemTheme = signal(false);

  listenToSystemThemeChanges() {
    if (this.isListeningToSystemTheme()) return;

    this.mediaQuery.addEventListener('change', this.systemThemeListener);
    this.isListeningToSystemTheme.set(true);
  }

  removeSystemThemeListener() {
    if (!this.isListeningToSystemTheme()) return;

    this.mediaQuery.removeEventListener('change', this.systemThemeListener);
    this.isListeningToSystemTheme.set(false);
  }

  toggleTheme() {
    if (this.isDark()) {
      this.setLight();
    } else {
      this.setDark();
    }
  }

  isDark(): boolean {
    return document.documentElement.classList.contains('dark-selector');
  }

  initTheme() {
    const themeState = this.themeState();
    if (themeState.darkMode === 'dark') {
      this.setDark();
    } else if (themeState.darkMode === 'light') {
      this.setLight();
    } else {
      this.applySystemDarkMode();
    }
  }

  initColorPallete() {
    const themeState = this.themeState();
    this.updatePrimary(themeState.primary ?? 'blue');
  }

  getPrimaryColor(color: string, shade: KinexaThemeShade = 500): string {
    return KINEXA_PRIMARY_PALETTES[color as KinexaPrimaryColor]?.[shade] ?? '';
  }

  setDark() {
    this.removeSystemThemeListener();
    document.documentElement.classList.add('dark-selector');
    this.themeState.update((state) => ({
      ...state,
      darkMode: 'dark',
    }));
    updateSurfacePalette(this.surfaces['neutral']);
  }

  setLight() {
    this.removeSystemThemeListener();
    document.documentElement.classList.remove('dark-selector');
    this.themeState.update((state) => ({
      ...state,
      darkMode: 'light',
    }));

    const surface = this.surfaces[this.themeState().surface ?? 'neutral'];

    updateSurfacePalette(surface);
  }

  updatePrimary(color: string) {
    switch (color) {
      case 'green':
        this.applyTheme(
          this.themePresets.green.primary,
          this.themePresets.green.secondary,
          this.themePresets.green.tertiary,
          this.themePresets.green.surface,
        );
        break;

      case 'red':
        this.applyTheme(
          this.themePresets.red.primary,
          this.themePresets.red.secondary,
          this.themePresets.red.tertiary,
          this.themePresets.red.surface,
        );
        break;

      case 'blue':
        this.applyTheme(
          this.themePresets.blue.primary,
          this.themePresets.blue.secondary,
          this.themePresets.blue.tertiary,
          this.themePresets.blue.surface,
        );
        break;

      case 'fuchsia':
        this.applyTheme(
          this.themePresets.fuchsia.primary,
          this.themePresets.fuchsia.secondary,
          this.themePresets.fuchsia.tertiary,
          this.themePresets.fuchsia.surface,
        );
        break;

      default:
        this.applyTheme(color as PrimeColor);
    }
  }

  applyTheme(
    primary: PrimeColor,
    secondary?: PrimeColor,
    tertiary?: PrimeColor,
    surface: SurfaceColor = 'neutral',
  ) {
    const primitive = Lara.primitive;

    if (!primitive) {
      return;
    }

    const primaryPalette =
      KINEXA_PRIMARY_PALETTES[primary as KinexaPrimaryColor] ?? primitive[primary];

    updatePreset({
      semantic: {
        primary: primaryPalette,
        ...(secondary ? { secondary: primitive[secondary] } : {}),
        ...(tertiary ? { tertiary: primitive[tertiary] } : {}),

        colorScheme: {
          light: {
            ...KINEXA_PRIMARY_COLOR_SCHEME.light,

            ...(secondary
              ? {
                  secondary: {
                    color: '{secondary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{secondary.600}',
                    activeColor: '{secondary.700}',
                  },
                }
              : {}),

            ...(tertiary
              ? {
                  tertiary: {
                    color: '{tertiary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{tertiary.600}',
                    activeColor: '{tertiary.700}',
                  },
                }
              : {}),
          },

          dark: {
            ...KINEXA_PRIMARY_COLOR_SCHEME.dark,

            ...(secondary
              ? {
                  secondary: {
                    color: '{secondary.400}',
                    contrastColor: '{surface.900}',
                    hoverColor: '{secondary.300}',
                    activeColor: '{secondary.200}',
                  },
                }
              : {}),

            ...(tertiary
              ? {
                  tertiary: {
                    color: '{tertiary.400}',
                    contrastColor: '{surface.900}',
                    hoverColor: '{tertiary.300}',
                    activeColor: '{tertiary.200}',
                  },
                }
              : {}),
          },
        },
      },
    });

    if (this.isDark()) {
      updateSurfacePalette(this.surfaces['neutral']);
    } else {
      updateSurfacePalette(this.surfaces[surface]);
    }

    this.themeState.update((state) => ({
      ...state,
      primary,
      secondary,
      tertiary,
      surface,
    }));
  }
}
