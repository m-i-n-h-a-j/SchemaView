export interface DatabaseConnection {
  id: string;
  name: string;
  provider: 'postgresql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  createdAt: string;
}
