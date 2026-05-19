import { Component, inject, input } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { PopUpService } from '../../../../services/pop-up/pop-up-service';
import { MessageService } from 'primeng/api';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { DatabaseConnection } from '../../../../shared/models/interfaces/db-connection';

@Component({
  selector: 'app-add-db-component',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './add-db-component.html',
  styleUrl: './add-db-component.css',
})
export class AddDbComponent {
  isCard = input(true);

  private connectionService = inject(ConnectionService);
  private popUpService = inject(PopUpService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  protected connection = new FormGroup({
    name: new FormControl('', Validators.required),
    host: new FormControl('', Validators.required),
    port: new FormControl(5432, Validators.required),
    database: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    ssl: new FormControl(false),
  });

  protected save() {
    this.messageService.clear();

    if (this.connection.invalid) {
      this.connection.markAllAsTouched();
      return;
    }

    const formValue = this.connection.getRawValue();

    const req: Omit<DatabaseConnection, 'id' | 'createdAt'> = {
      provider: 'postgresql',
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
