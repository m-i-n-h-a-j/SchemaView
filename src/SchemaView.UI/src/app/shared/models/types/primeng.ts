import Lara from '@primeuix/themes/aura';

export type PrimeColor = Exclude<keyof NonNullable<typeof Lara.primitive>, 'borderRadius'>;
export type SurfaceColor =
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'soho'
  | 'viva'
  | 'ocean';
