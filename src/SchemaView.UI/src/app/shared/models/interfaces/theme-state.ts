import { SurfaceColor } from '../types/primeng';

export interface ThemeState {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  surface?: SurfaceColor;
  darkMode: 'light' | 'dark' | 'system';
}
