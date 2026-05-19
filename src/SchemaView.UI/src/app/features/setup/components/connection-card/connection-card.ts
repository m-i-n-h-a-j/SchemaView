import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DatabaseConnection } from '../../../../shared/models/interfaces/db-connection';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';
import { ThemeService } from '../../../../services/theme/theme-service';

@Component({
  selector: 'app-connection-card',
  imports: [DatePipe, IconComponent],
  templateUrl: './connection-card.html',
  styleUrl: './connection-card.css',
})
export class ConnectionCardComponent {
  conn = input.required<DatabaseConnection>();
  delete = output<string>();

  protected themeService = inject(ThemeService);
  private router = inject(Router);
  protected readonly icons = APP_ICONS;

  protected onDelete() {
    this.delete.emit(this.conn().id);
  }

  protected onConnect() {
    this.router.navigate(['/connections', this.conn().id]);
  }
}
