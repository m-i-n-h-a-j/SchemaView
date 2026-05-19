import { inject, Injectable, OnInit, signal } from '@angular/core';
import { DatabaseConnection } from '../../shared/models/interfaces/db-connection';
import { ApiService } from '../api/api-service';
import { ServiceUrl } from '../../shared/models/enums/serviceUrl';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private dbConnections = signal<DatabaseConnection[]>([]);
  readonly connections = this.dbConnections.asReadonly();
  private apiService = inject(ApiService);

  constructor() {
    this.dbConnections.set(this.getAllConnections());
  }

  addDb(connection: Omit<DatabaseConnection, 'id' | 'createdAt'>) {
    const storageKey = 'schemaview.connections';
    const existingConnections = this.getAllConnections();

    const newConnection: DatabaseConnection = {
      ...connection,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };


    const connections = [...existingConnections, newConnection];
    localStorage.setItem(storageKey, JSON.stringify(connections));
    this.dbConnections.set(connections);
  }

  getAllConnections(): DatabaseConnection[] {
    const storageKey = 'schemaview.connections';
    const existingConnections = localStorage.getItem(storageKey);
    return existingConnections ? JSON.parse(existingConnections) : [];
  }

  deleteDb(id: string) {
    const storageKey = 'schemaview.connections';
    const existingConnections = this.getAllConnections();
    const updatedConnections = existingConnections.filter((conn) => conn.id !== id);

    localStorage.setItem(storageKey, JSON.stringify(updatedConnections));
    this.dbConnections.set(updatedConnections);
  }

  testConnection(connection: Omit<DatabaseConnection, 'id' | 'createdAt'>) {
    return this.apiService.post(ServiceUrl.ApiServer, 'connections/test', connection);
  }
}
