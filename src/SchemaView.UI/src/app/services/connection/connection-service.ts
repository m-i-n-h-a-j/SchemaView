import { Injectable, signal } from '@angular/core';
import { DatabaseConnection } from '../../shared/models/interfaces/db-connection';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private dbConnections = signal<DatabaseConnection[]>([]);
  readonly connections = this.dbConnections.asReadonly();

  constructor() {
    this.dbConnections.set(this.getAllConnections());
  }

  addDb(connection: Omit<DatabaseConnection, 'id' | 'createdAt'>) {
    const storageKey = 'schemaview.connections';
    const existingConnections = this.getAllConnections();

    const newConnection: DatabaseConnection = {
      ...connection,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const connections = [...existingConnections, newConnection];
    localStorage.setItem(storageKey, JSON.stringify(connections));
    this.dbConnections.set(connections);

    console.log('Saved:', connections);
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

    console.log('Deleted:', id);
  }
}
