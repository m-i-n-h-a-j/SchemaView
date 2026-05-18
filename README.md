# SchemaView

SchemaView is a lightweight database explorer and data viewer built with ASP.NET
Core and Angular.

The goal of SchemaView is to provide a fast, focused alternative to traditional
database administration tools for day-to-day development workflows.

## Current Status

This repository currently contains the application scaffold:

- ASP.NET Core Web API host
- Layered backend projects for API, Application, Domain, and Infrastructure
- Angular frontend application
- Tailwind CSS frontend styling setup
- Development OpenAPI support in the API project

Database browsing, provider integrations, and query execution features are
planned and will be implemented on top of this structure.

## Planned Features

- Runtime database connections
- PostgreSQL support
- Schema explorer
- Table browser
- Dynamic data viewer
- Server-side filtering
- Sorting and pagination
- Query execution
- Lazy loading for large schemas and tables
- Metadata caching
- Responsive Angular UI
- Dark mode support

## Technology Stack

### Backend

- ASP.NET Core
- .NET target framework: `net10.0`
- OpenAPI support via `Microsoft.AspNetCore.OpenApi`

### Frontend

- Angular
- TypeScript
- Tailwind CSS
- RxJS
- Vitest / Angular test builder

## Project Structure

```text
SchemaView/
|-- SchemaView.slnx
|-- LICENSE
|-- README.md
`-- src/
    |-- SchemaView.API/
    |   |-- Program.cs
    |   |-- appsettings.json
    |   |-- appsettings.Development.json
    |   `-- Properties/
    |       `-- launchSettings.json
    |-- SchemaView.Application/
    |   `-- SchemaView.Application.csproj
    |-- SchemaView.Domain/
    |   `-- SchemaView.Domain.csproj
    |-- SchemaView.Infrastructure/
    |   `-- SchemaView.Infrastructure.csproj
    `-- SchemaView.UI/
        |-- angular.json
        |-- package.json
        |-- package-lock.json
        |-- public/
        `-- src/
            |-- index.html
            |-- main.ts
            |-- styles.css
            `-- app/
```

## Architecture

```text
Angular UI
   |
ASP.NET Core API
   |
Application Layer
   |
Domain Layer
   |
Infrastructure / Database Provider Layer
   |
Target Database
```

### Backend Projects

- `SchemaView.API` - ASP.NET Core host, HTTP pipeline, controllers, and OpenAPI.
- `SchemaView.Application` - application services and use-case orchestration.
- `SchemaView.Domain` - domain models, contracts, and core database explorer concepts.
- `SchemaView.Infrastructure` - database provider implementations, data access, and external integrations.

### Frontend Project

- `SchemaView.UI` - Angular application for browsing connections, schemas, tables,
  and query results.

## Development Setup

### Prerequisites

- .NET SDK with `net10.0` support
- Node.js and npm
- PostgreSQL or another target database once provider support is implemented

### Restore and Build

```bash
dotnet restore SchemaView.slnx
dotnet build SchemaView.slnx
```

### Run the API

```bash
dotnet run --project src/SchemaView.API/SchemaView.API.csproj
```

The API development profiles are configured for:

- `http://localhost:5051`
- `https://localhost:7237`

In Development, the API maps an OpenAPI document.

### Run the Frontend

```bash
cd src/SchemaView.UI
npm install
npm start
```

### Frontend Build and Tests

```bash
cd src/SchemaView.UI
npm run build
npm test
```

## Database Support Roadmap

| Database   | Status  |
| ---------- | ------- |
| PostgreSQL | Planned |
| SQL Server | Planned |
| MySQL      | Planned |
| SQLite     | Planned |

## Design Goals

- Load faster than heavier database administration tools
- Handle large databases through lazy loading and pagination
- Keep the workflow clean and developer-focused
- Avoid unnecessary administration features and overhead
- Support multiple database providers over time

## Performance Strategy

SchemaView is intended to optimize for:

- Lazy loading
- Server-side pagination
- Virtual scrolling
- Metadata caching
- Minimal network payloads
- Efficient SQL generation

## Security Notes

Planned database operations should validate schemas, tables, and columns before
generating dynamic SQL.

Raw SQL execution should be limited to trusted development environments and
should use query limits, pagination, and parameterized execution wherever
possible.

## License

SchemaView is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Vision

SchemaView aims to become a modern, fast, developer-friendly database exploration
platform focused on productivity and performance.
