import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';

import { MessageService, ConfirmationService } from 'primeng/api';
import { provideNgProgressOptions } from 'ngx-progressbar';

import { ThemeService } from './services/theme/theme-service';
import { KinexaDefaultPreset } from './shared/theme/theme';

function initializeApp() {
  const themeService = inject(ThemeService);
  themeService.initTheme();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initializeApp),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNgProgressOptions({
      debounceTime: 100,
      trickleSpeed: 200,
      min: 10,
      flat: true,
      spinner: false,
    }),
    providePrimeNG({
      ripple: false,
      theme: {
        preset: KinexaDefaultPreset,
        options: {
          darkModeSelector: '.dark-selector',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
