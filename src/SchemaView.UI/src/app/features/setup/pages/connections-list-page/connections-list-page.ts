import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { ThemeService } from '../../../../services/theme/theme-service';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';

@Component({
  selector: 'app-connections-list-page',
  imports: [ButtonComponent, IconComponent, DatePipe],
  templateUrl: './connections-list-page.html',
  styleUrl: './connections-list-page.css',
})
export class ConnectionsListPage {
  protected connectionService = inject(ConnectionService);
  protected themeService = inject(ThemeService);
  private router = inject(Router);

  protected readonly icons = APP_ICONS;

  protected goToAddConnection() {
    this.router.navigate(['/'], { queryParams: { add: 'true' } });
  }

  protected deleteConnection(id: string) {
    if (confirm('Are you sure you want to delete this database connection?')) {
      this.connectionService.deleteDb(id);
    }
  }
}
