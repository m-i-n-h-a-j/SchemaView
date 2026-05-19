export interface TableDataQuery {
  offset?: number;
  limit?: number;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc' | null;
}
