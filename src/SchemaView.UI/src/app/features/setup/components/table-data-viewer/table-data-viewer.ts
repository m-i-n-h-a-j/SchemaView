import { Component, inject, input, output, signal, effect, untracked } from '@angular/core';
import { DatabaseService } from '../../../../services/database/database-service';
import { DatabaseConnection } from '../../../../shared/models/interfaces/db-connection';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';
import { TableDataDto } from '../../../../shared/models/interfaces/table-data-dto';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-table-data-viewer',
  imports: [IconComponent],
  templateUrl: './table-data-viewer.html',
  styleUrl: './table-data-viewer.css',
  host: {
    class: 'flex flex-1 min-h-0 min-w-0 w-full',
  },
})
export class TableDataViewerComponent {
  private databaseService = inject(DatabaseService);

  connection = input.required<DatabaseConnection | undefined>();
  schema = input.required<string>();
  table = input.required<string>();

  back = output<void>();

  protected tableData = signal<TableDataDto | null>(null);
  protected isLoadingTableData = signal(false);
  protected isLoadingMoreRows = signal(false);
  protected tableDataError = signal<string | null>(null);
  protected activeTab = signal<'data' | 'schema'>('data');
  protected isFullScreen = signal(false);
  protected sortColumn = signal<string | null>(null);
  protected sortDirection = signal<SortDirection>('asc');

  protected readonly icons = APP_ICONS;
  private readonly pageSize = 50;
  private requestVersion = 0;
  private selectedTableKey: string | null = null;

  constructor() {
    effect(() => {
      const conn = this.connection();
      const schema = this.schema();
      const table = this.table();

      if (conn && schema && table) {
        const tableKey = `${schema}.${table}`;
        if (this.selectedTableKey !== tableKey) {
          this.selectedTableKey = tableKey;
          this.sortColumn.set(null);
          this.sortDirection.set('asc');
        }

        untracked(() => this.loadTableData(conn, schema, table, true));
      }
    });
  }

  protected loadTableData(conn: DatabaseConnection, schema: string, table: string, reset: boolean) {
    const currentData = this.tableData();
    const offset = reset ? 0 : (currentData?.rows.length ?? 0);
    const version = reset ? ++this.requestVersion : this.requestVersion;

    if (!reset && (!currentData || this.isLoadingMoreRows() || offset >= currentData.totalRows)) {
      return;
    }

    if (reset) {
      this.tableData.set(null);
      this.isLoadingTableData.set(true);
      this.isLoadingMoreRows.set(false);
    } else {
      this.isLoadingMoreRows.set(true);
    }

    this.tableDataError.set(null);

    this.databaseService
      .getTableData(conn, schema, table, {
        offset,
        limit: this.pageSize,
        sortColumn: this.sortColumn(),
        sortDirection: this.sortDirection(),
      })
      .subscribe({
        next: (data) => {
          if (version !== this.requestVersion) {
            return;
          }

          if (reset) {
            this.tableData.set(data);
          } else {
            this.tableData.set({
              ...data,
              columns: currentData?.columns ?? data.columns,
              rows: [...(currentData?.rows ?? []), ...data.rows],
            });
          }

          this.isLoadingTableData.set(false);
          this.isLoadingMoreRows.set(false);
        },
        error: (err) => {
          if (version !== this.requestVersion) {
            return;
          }

          this.tableDataError.set(
            err.error?.message || `Failed to load data for table "${table}".`,
          );
          this.isLoadingTableData.set(false);
          this.isLoadingMoreRows.set(false);
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
      this.loadTableData(conn, schema, table, true);
    }
  }

  protected onDataScroll(event: Event) {
    const element = event.target as HTMLElement;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceFromBottom > 160) {
      return;
    }

    const conn = this.connection();
    const schema = this.schema();
    const table = this.table();
    if (conn && schema && table) {
      this.loadTableData(conn, schema, table, false);
    }
  }

  protected sortByColumn(columnName: string) {
    if (this.sortColumn() === columnName) {
      this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(columnName);
      this.sortDirection.set('asc');
    }

    const conn = this.connection();
    const schema = this.schema();
    const table = this.table();
    if (conn && schema && table) {
      this.loadTableData(conn, schema, table, true);
    }
  }

  protected loadedRowCount() {
    return this.tableData()?.rows.length ?? 0;
  }

  protected getColumnSortIcon(columnName: string) {
    if (this.sortColumn() === columnName) {
      return this.sortDirection() === 'asc'
        ? this.icons.sort_descending
        : this.icons.sort_ascending;
    } else {
      return this.icons.reorder;
    }
  }

  protected getColumnSortTitle(columnName: string) {
    if (this.sortColumn() === columnName) {
      return this.sortDirection() === 'asc' ? ' Ascending' : ' Descending';
    } else {
      return 'Sort by ' + columnName;
    }
  }
}
