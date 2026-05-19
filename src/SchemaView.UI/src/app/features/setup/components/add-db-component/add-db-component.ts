import { Component, inject, input } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { PopUpService } from '../../../../services/pop-up/pop-up-service';
import { MessageService } from 'primeng/api';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { DatabaseConnection } from '../../../../shared/models/interfaces/db-connection';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-add-db-component',
  imports: [ReactiveFormsModule, ButtonComponent, SelectModule],
  templateUrl: './add-db-component.html',
  styleUrl: './add-db-component.css',
})
export class AddDbComponent {
  isCard = input(true);

  protected providerOptions = [
    { label: 'PostgreSQL', value: 'postgresql' },
    { label: 'SQL Server', value: 'sqlserver' },
    { label: 'MySQL', value: 'mysql' },
    { label: 'Oracle', value: 'oracle' },
  ];

  private connectionService = inject(ConnectionService);
  private popUpService = inject(PopUpService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  protected connection = new FormGroup({
    provider: new FormControl<'postgresql' | 'sqlserver' | 'mysql' | 'oracle'>(
      'postgresql',
      Validators.required,
    ),
    name: new FormControl('', Validators.required),
    host: new FormControl('', Validators.required),
    port: new FormControl<number | null>(5432, Validators.required),
    database: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    ssl: new FormControl(false),
  });

  constructor() {
    this.connection.get('provider')?.valueChanges.subscribe((value) => {
      const portControl = this.connection.get('port');
      if (portControl) {
        if (value === 'postgresql') {
          portControl.setValue(5432);
        } else if (value === 'oracle') {
          portControl.setValue(1521);
        } else {
          portControl.setValue(null);
        }
      }
    });
  }

  protected save() {
    this.messageService.clear();

    if (this.connection.invalid) {
      this.connection.markAllAsTouched();
      return;
    }

    const formValue = this.connection.getRawValue();

    const req: Omit<DatabaseConnection, 'id' | 'createdAt'> = {
      provider: formValue.provider ?? 'postgresql',
      name: formValue.name ?? '',
      host: formValue.host ?? '',
      port: formValue.port ?? 5432,
      database: formValue.database ?? '',
      username: formValue.username ?? '',
      password: formValue.password ?? '',
      ssl: formValue.ssl ?? false,
    };

    this.connectionService.testConnection(req).subscribe({
      next: () => {
        this.connectionService.addDb(req);
        this.connection.reset({
          provider: 'postgresql',
          port: 5432,
          ssl: false,
        });
        this.popUpService.closeAddDbConnectionPopUp();
        this.router.navigate(['/connections']);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'New connection added successfully',
        });
      },
      error: (error) => {
        const errorMessage = error.error.message
          ? error.error.message
          : 'Failed to connect to the database. Please check the connection details.';
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: errorMessage,
        });
      },
    });
  }
}
