import { Routes } from '@angular/router';
import { InitialSetupPage } from './features/setup/pages/initial-setup-page/initial-setup-page';
import { ConnectionsListPage } from './features/setup/pages/connections-list-page/connections-list-page';
import { DatabaseExplorerPage } from './features/setup/pages/database-explorer-page/database-explorer-page';

export const routes: Routes = [
  { path: '', component: InitialSetupPage },
  { path: 'connections', component: ConnectionsListPage },
  { path: 'connections/:id', component: DatabaseExplorerPage },
];
