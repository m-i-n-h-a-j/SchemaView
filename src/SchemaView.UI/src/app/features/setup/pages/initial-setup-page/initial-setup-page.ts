import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { ThemeService } from '../../../../services/theme/theme-service';
import { AddDbComponent } from '../../components/add-db-component/add-db-component';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';

@Component({
  selector: 'app-initial-setup-page',
  imports: [AddDbComponent, IconComponent],
  templateUrl: './initial-setup-page.html',
  styleUrl: './initial-setup-page.css',
})
export class InitialSetupPage implements OnInit {
  protected connectionService = inject(ConnectionService);
  protected themeService = inject(ThemeService);
  private router = inject(Router);

  protected readonly icons = APP_ICONS;

  protected get isFirstConnection(): boolean {
    return this.connectionService.connections().length === 0;
  }

  ngOnInit() {
    if (!this.isFirstConnection) {
      this.router.navigate(['/connections']);
    }
  }
}
