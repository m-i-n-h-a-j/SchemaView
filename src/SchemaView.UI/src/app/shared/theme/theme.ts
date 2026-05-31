import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { generateMaterialTheme } from './material-theme.generator';
import { createPrimeNgThemePreset, DEFAULT_SAFE_SEED_COLOR } from './theme-tokens';

export const SchemaViewDefaultPreset = definePreset(
  Aura,
  createPrimeNgThemePreset(generateMaterialTheme(DEFAULT_SAFE_SEED_COLOR, 'light')),
);
