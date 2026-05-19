import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { AddDbComponent } from '../../components/add-db-component/add-db-component';

@Component({
  selector: 'app-initial-setup-page',
  imports: [AddDbComponent],
  templateUrl: './initial-setup-page.html',
  styleUrl: './initial-setup-page.css',
})
export class InitialSetupPage implements OnInit {
  protected connectionService = inject(ConnectionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected get isFirstConnection(): boolean {
    return this.connectionService.connections().length === 0;
  }

  ngOnInit() {
    const isAdding = this.route.snapshot.queryParamMap.has('add');
    if (this.connectionService.connections().length > 0 && !isAdding) {
      this.router.navigate(['/connections']);
    }
  }
}
