import { ColumnDataDto } from './column-data-dto';

export interface TableDataDto {
  schema: string;
  table: string;
  columns: ColumnDataDto[];
  rows: Record<string, any>[];
  totalRows: number;
}
