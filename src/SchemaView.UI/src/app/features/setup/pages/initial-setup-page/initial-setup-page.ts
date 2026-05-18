import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { AddDbComponent } from '../../components/add-db-component/add-db-component';

@Component({
  selector: 'app-initial-setup-page',
  imports: [AddDbComponent],
  templateUrl: './initial-setup-page.html',
  styleUrl: './initial-setup-page.css',
})
export class InitialSetupPage implements OnInit {
  private connectionService = inject(ConnectionService);
  private router = inject(Router);

  ngOnInit() {
    if (this.connectionService.connections().length > 0) {
      this.router.navigate(['/connections']);
    }
  }
}
