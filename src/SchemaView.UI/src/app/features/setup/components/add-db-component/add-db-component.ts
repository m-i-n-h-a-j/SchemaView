import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { ThemeService } from '../../../../services/theme/theme-service';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';

@Component({
  selector: 'app-add-db-component',
  imports: [ReactiveFormsModule, ButtonComponent, IconComponent],
  templateUrl: './add-db-component.html',
  styleUrl: './add-db-component.css',
})
export class AddDbComponent {
  private connectionService = inject(ConnectionService);
  protected themeService = inject(ThemeService);
  private router = inject(Router);

  protected readonly icons = APP_ICONS;

  protected connection = new FormGroup({
    name: new FormControl('', Validators.required),
    host: new FormControl('', Validators.required),
    port: new FormControl(5432, Validators.required),
    database: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    ssl: new FormControl(true),
  });

  protected save() {
    if (this.connection.invalid) {
      this.connection.markAllAsTouched();
      return;
    }

    const formValue = this.connection.getRawValue();

    this.connectionService.addDb({
      provider: 'postgresql',
      name: formValue.name ?? '',
      host: formValue.host ?? '',
      port: formValue.port ?? 5432,
      database: formValue.database ?? '',
      username: formValue.username ?? '',
      password: formValue.password ?? '',
      ssl: formValue.ssl ?? false,
    });

    this.connection.reset({
      port: 5432,
      ssl: true,
    });

    this.router.navigate(['/connections']);
  }
}
