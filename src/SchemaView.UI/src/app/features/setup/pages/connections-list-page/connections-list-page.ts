import { Component, inject } from '@angular/core';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { ThemeService } from '../../../../services/theme/theme-service';
import { PopUpService } from '../../../../services/pop-up/pop-up-service';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';
import { ConnectionCardComponent } from '../../components/connection-card/connection-card';
import { PopUpComponent } from '../../../../shared/components/pop-up-component/pop-up-component';
import { AddDbComponent } from '../../components/add-db-component/add-db-component';

@Component({
  selector: 'app-connections-list-page',
  imports: [
    ButtonComponent,
    IconComponent,
    ConnectionCardComponent,
    PopUpComponent,
    AddDbComponent,
  ],
  templateUrl: './connections-list-page.html',
  styleUrl: './connections-list-page.css',
  host: {
    class: 'block min-w-0',
  },
})
export class ConnectionsListPage {
  protected connectionService = inject(ConnectionService);
  protected themeService = inject(ThemeService);
  protected popUpService = inject(PopUpService);

  protected readonly icons = APP_ICONS;

  protected goToAddConnection() {
    this.popUpService.showAddDbConnectionPopUp();
  }

  protected deleteConnection(id: string) {
    if (confirm('Are you sure you want to delete this database connection?')) {
      this.connectionService.deleteDb(id);
    }
  }
}
