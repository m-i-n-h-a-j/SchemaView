import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/setup/pages/initial-setup-page/initial-setup-page').then(
        (m) => m.InitialSetupPage,
      ),
  },
  {
    path: 'connections',
    loadComponent: () =>
      import('./features/setup/pages/connections-list-page/connections-list-page').then(
        (m) => m.ConnectionsListPage,
      ),
  },
  {
    path: 'connections/:id',
    loadComponent: () =>
      import('./features/setup/pages/database-explorer-page/database-explorer-page').then(
        (m) => m.DatabaseExplorerPage,
      ),
  },
];
