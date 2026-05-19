import { Component, inject, input, output, signal, effect } from '@angular/core';
import { DatabaseService, TableDataDto } from '../../../../services/database/database-service';
import { DatabaseConnection } from '../../../../shared/models/interfaces/db-connection';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';

@Component({
  selector: 'app-table-data-viewer',
  imports: [IconComponent],
  templateUrl: './table-data-viewer.html',
  styleUrl: './table-data-viewer.css',
})
export class TableDataViewerComponent {
  private databaseService = inject(DatabaseService);

  connection = input.required<DatabaseConnection | undefined>();
  schema = input.required<string>();
  table = input.required<string>();

  back = output<void>();

  protected tableData = signal<TableDataDto | null>(null);
  protected isLoadingTableData = signal(false);
  protected tableDataError = signal<string | null>(null);
  protected activeTab = signal<'data' | 'schema'>('data');
  protected isFullScreen = signal(false);

  protected readonly icons = APP_ICONS;

  constructor() {
    effect(() => {
      const conn = this.connection();
      const schema = this.schema();
      const table = this.table();

      if (conn && schema && table) {
        this.loadTableData(conn, schema, table);
      }
    });
  }

  protected loadTableData(conn: DatabaseConnection, schema: string, table: string) {
    this.tableData.set(null);
    this.tableDataError.set(null);
    this.isLoadingTableData.set(true);

    this.databaseService.getTableData(conn, schema, table).subscribe({
      next: (data) => {
        this.tableData.set(data);
        this.isLoadingTableData.set(false);
      },
      error: (err) => {
        this.tableDataError.set(err.error?.message || `Failed to load data for table "${table}".`);
        this.isLoadingTableData.set(false);
      },
    });
  }

  protected toggleFullScreen() {
    this.isFullScreen.update((v) => !v);
  }

  protected onBack() {
    this.back.emit();
  }

  protected retryLoading() {
    const conn = this.connection();
    const schema = this.schema();
    const table = this.table();
    if (conn && schema && table) {
      this.loadTableData(conn, schema, table);
    }
  }
}
