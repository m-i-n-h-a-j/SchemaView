import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api-service';
import { ServiceUrl } from '../../shared/models/enums/serviceUrl';
import { DatabaseConnection } from '../../shared/models/interfaces/db-connection';
import { Observable } from 'rxjs';

export interface SchemaDto {
  name: string;
}

export interface TableDto {
  schema: string;
  name: string;
}

export interface ColumnDataDto {
  name: string;
  dataType: string;
  isNullable: boolean;
}

export interface TableDataDto {
  schema: string;
  table: string;
  columns: ColumnDataDto[];
  rows: Record<string, any>[];
  totalRows: number;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private apiService = inject(ApiService);

  getSchemas(connection: DatabaseConnection): Observable<SchemaDto[]> {
    // Exclude properties not needed or map to match DatabaseConnectionDto structure
    const dbConnDto = {
      provider: connection.provider,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
      ssl: connection.ssl,
    };
    return this.apiService.post<SchemaDto[]>(ServiceUrl.ApiServer, 'database/schemas', dbConnDto);
  }

  getTables(connection: DatabaseConnection, schema: string): Observable<TableDto[]> {
    const dbConnDto = {
      provider: connection.provider,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
      ssl: connection.ssl,
    };
    return this.apiService.post<TableDto[]>(
      ServiceUrl.ApiServer,
      `database/tables/${schema}`,
      dbConnDto,
    );
  }

  getTableData(
    connection: DatabaseConnection,
    schema: string,
    table: string,
  ): Observable<TableDataDto> {
    const dbConnDto = {
      provider: connection.provider,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
      ssl: connection.ssl,
    };
    return this.apiService.post<TableDataDto>(
      ServiceUrl.ApiServer,
      `database/tables/${schema}/${table}`,
      dbConnDto,
    );
  }
}
