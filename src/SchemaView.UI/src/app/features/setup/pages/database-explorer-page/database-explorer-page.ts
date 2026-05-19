import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConnectionService } from '../../../../services/connection/connection-service';
import { DatabaseService } from '../../../../services/database/database-service';
import { ThemeService } from '../../../../services/theme/theme-service';
import { IconComponent } from '../../../../shared/components/icon-component/icon-component';
import { APP_ICONS } from '../../../../shared/models/constants/icons';
import { FormsModule } from '@angular/forms';
import { TableDataViewerComponent } from '../../components/table-data-viewer/table-data-viewer';
import { SchemaDto } from '../../../../shared/models/interfaces/schema-dto';
import { TableDto } from '../../../../shared/models/interfaces/table-dto';

@Component({
  selector: 'app-database-explorer-page',
  imports: [IconComponent, RouterLink, FormsModule, TableDataViewerComponent],
  templateUrl: './database-explorer-page.html',
  styleUrl: './database-explorer-page.css',
  host: {
    class: 'block min-w-0',
  },
})
export class DatabaseExplorerPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected connectionService = inject(ConnectionService);
  private databaseService = inject(DatabaseService);
  protected themeService = inject(ThemeService);

  protected readonly icons = APP_ICONS;

  protected connectionId = this.route.snapshot.paramMap.get('id');
  protected connection = computed(() =>
    this.connectionService.connections().find((c) => c.id === this.connectionId),
  );

  protected isLoadingSchemas = signal(false);
  protected isLoadingTables = signal(false);
  protected schemas = signal<SchemaDto[]>([]);
  protected tables = signal<TableDto[]>([]);
  protected selectedSchema = signal<string | null>(null);
  protected selectedTable = signal<string | null>(null);

  protected schemaSearch = signal('');
  protected tableSearch = signal('');
  protected error = signal<string | null>(null);

  protected filteredSchemas = computed(() => {
    const search = this.schemaSearch().toLowerCase();
    return this.schemas().filter((s) => s.name.toLowerCase().includes(search));
  });

  protected filteredTables = computed(() => {
    const search = this.tableSearch().toLowerCase();
    return this.tables().filter((t) => t.name.toLowerCase().includes(search));
  });

  ngOnInit() {
    if (!this.connection()) {
      this.router.navigate(['/connections']);
      return;
    }

    const initialSchema = this.route.snapshot.queryParamMap.get('schema');
    this.loadSchemas(initialSchema);

    this.route.queryParams.subscribe((params) => {
      const schema = params['schema'];
      if (
        schema &&
        schema !== this.selectedSchema() &&
        this.schemas().some((s) => s.name === schema)
      ) {
        this.selectSchema(schema, false);
      }

      const table = params['table'];
      if (!table && this.selectedTable()) {
        this.clearSelectedTable(false);
      } else if (
        table &&
        table !== this.selectedTable() &&
        this.tables().some((t) => t.name === table)
      ) {
        this.selectTable(table, false);
      }
    });
  }

  protected loadSchemas(preselectedSchema?: string | null) {
    const conn = this.connection();
    if (!conn) return;

    this.isLoadingSchemas.set(true);
    this.error.set(null);
    this.databaseService.getSchemas(conn).subscribe({
      next: (data) => {
        this.schemas.set(data);
        this.isLoadingSchemas.set(false);
        if (data.length > 0) {
          const hasPreselected =
            preselectedSchema && data.some((s) => s.name === preselectedSchema);
          const defaultSchema = hasPreselected
            ? preselectedSchema
            : data.find((s) => s.name === 'public')?.name || data[0].name;

          this.selectSchema(defaultSchema!, false);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load schemas from the database.');
        this.isLoadingSchemas.set(false);
      },
    });
  }

  protected selectSchema(schema: string, updateUrl: boolean = true) {
    this.selectedSchema.set(schema);
    this.selectedTable.set(null);

    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { schema: schema, table: null },
        queryParamsHandling: 'merge',
      });
    }

    const conn = this.connection();
    if (!conn) return;

    this.isLoadingTables.set(true);
    this.error.set(null);
    this.databaseService.getTables(conn, schema).subscribe({
      next: (data) => {
        this.tables.set(data);
        this.isLoadingTables.set(false);

        const tableParam = this.route.snapshot.queryParamMap.get('table');
        if (tableParam && data.some((t) => t.name === tableParam)) {
          this.selectTable(tableParam, false);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || `Failed to load tables for schema "${schema}".`);
        this.isLoadingTables.set(false);
      },
    });
  }

  protected selectTable(tableName: string, updateUrl: boolean = true) {
    this.selectedTable.set(tableName);

    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { table: tableName },
        queryParamsHandling: 'merge',
      });
    }
  }

  protected clearSelectedTable(updateUrl: boolean = true) {
    this.selectedTable.set(null);

    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { table: null },
        queryParamsHandling: 'merge',
      });
    }
  }
}
