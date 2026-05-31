import {
  MaterialGeneratedTheme,
  MaterialPrimePalettes,
  MaterialThemeRole,
  MaterialThemeScheme,
} from './material-theme.types';

export const DARK_MODE_CLASS = 'dark-selector';

const ROLE_ALIASES: Partial<Record<MaterialThemeRole, string>> = {
  onSurface: '--on-surface',
  onSurfaceVariant: '--on-surface-variant',
  outline: '--outline',
  outlineVariant: '--outline-variant',
  error: '--error',
};

export function applyMaterialThemeToDom(root: HTMLElement, theme: MaterialGeneratedTheme): void {
  root.classList.toggle(DARK_MODE_CLASS, theme.isDark);
  root.dataset['themeMode'] = theme.activeMode;
  root.style.colorScheme = theme.activeMode;

  const variables = createMaterialThemeCssVariables(theme.scheme, theme.primePalettes);

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}

export function createMaterialThemeCssVariables(
  scheme: MaterialThemeScheme,
  palettes: MaterialPrimePalettes,
): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const [role, value] of Object.entries(scheme) as [MaterialThemeRole, string][]) {
    variables[toMaterialCssVariable(role)] = value;
    variables[`${toMaterialCssVariable(role)}-rgb`] = toRgbChannels(value);

    const alias = ROLE_ALIASES[role];
    if (alias) {
      variables[alias] = value;
    }
  }

  for (const [paletteName, palette] of Object.entries(palettes)) {
    for (const [shade, value] of Object.entries(palette)) {
      variables[`--md-${toKebabCase(paletteName)}-${shade}`] = value;
      variables[`--md-${toKebabCase(paletteName)}-${shade}-rgb`] = toRgbChannels(value);
    }
  }

  variables['--ng-progress-color'] = scheme.primary;
  variables['--app-background'] = scheme.background;
  variables['--app-foreground'] = scheme.onBackground;

  return variables;
}

function toMaterialCssVariable(role: string): string {
  return `--md-${toKebabCase(role)}`;
}

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function toRgbChannels(hexColor: string): string {
  const normalized = hexColor.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return `${r} ${g} ${b}`;
}
