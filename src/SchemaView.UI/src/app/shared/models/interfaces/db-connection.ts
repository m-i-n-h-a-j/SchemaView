export interface DatabaseConnection {
  id: string;
  name: string;
  provider: 'postgresql' | 'sqlserver' | 'mysql' | 'oracle';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  createdAt: string;
}
