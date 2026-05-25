# SchemaView

SchemaView is a lightweight database explorer and data viewer built with
ASP.NET Core and Angular. It is designed for developer workflows where you need
to connect to a database, inspect schemas and tables, and view table data
without opening a heavier administration tool.

## Features

- Runtime database connection setup
- Saved browser-side connection profiles
- PostgreSQL and Oracle connection testing
- PostgreSQL and Oracle schema browsing
- Table browsing by schema
- Paginated table data viewing
- Column metadata display
- Server-side sorting support
- Responsive Angular UI
- Dark mode support

## Technology Stack

### Backend

- ASP.NET Core
- .NET target framework: `net10.0`
- OpenAPI support via `Microsoft.AspNetCore.OpenApi`
- Scalar API reference in Development
- `Npgsql` for PostgreSQL
- `Oracle.ManagedDataAccess` for Oracle

### Frontend

- Angular
- TypeScript
- PrimeNG
- Tailwind CSS
- RxJS
- Vitest / Angular test builder

## Project Structure

```text
SchemaView/
|-- Dockerfile
|-- SchemaView.slnx
|-- .github/
|   `-- workflows/
|       `-- docker-image.yml
`-- src/
    |-- SchemaView.API/
    |   |-- Controllers/
    |   |-- Program.cs
    |   `-- SchemaView.API.csproj
    |-- SchemaView.Application/
    |-- SchemaView.Domain/
    |-- SchemaView.Infrastructure/
    `-- SchemaView.UI/
        |-- angular.json
        |-- package.json
        `-- src/
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

## Development Setup

### Prerequisites

- .NET SDK with `net10.0` support
- Node.js 24 or newer
- npm
- PostgreSQL or Oracle database for end-to-end testing

### Restore and Build

```bash
dotnet restore SchemaView.slnx
dotnet build SchemaView.slnx
```

### Run the API

```bash
dotnet run --project src/SchemaView.API/SchemaView.API.csproj
```

Development profiles are configured for:

- `http://localhost:5051`
- `https://localhost:7237`

In Development, the API maps OpenAPI and Scalar endpoints.

### Run the Frontend

```bash
cd src/SchemaView.UI
npm install
npm start
```

The development frontend calls the API at `http://localhost:5051`.

### Frontend Build and Tests

```bash
cd src/SchemaView.UI
npm run build
npm test
```

## Local Windows Publish

For a local Windows build, publish the API and copy the Angular production build
into `wwwroot`.

```powershell
cd src\SchemaView.UI
npm ci
npm run build -- --configuration=production --base-href=/ --deploy-url=/

cd ..\..
dotnet publish src\SchemaView.API\SchemaView.API.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  -p:PublishTrimmed=false `
  -o .\publish

Remove-Item .\publish\wwwroot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path .\publish\wwwroot -Force | Out-Null
Copy-Item src\SchemaView.UI\dist\SchemaView.UI\browser\* .\publish\wwwroot -Recurse -Force
```

Run the published app:

```powershell
.\publish\SchemaView.API.exe --urls http://localhost:5000
```

Do not enable trimmed publish for this app. MVC controllers are discovered via
reflection, and trimming can remove them from the published assembly. When that
happens, API calls such as `POST /api/connections/test` fall through to the SPA
fallback and return `405 Method Not Allowed`.

## GitHub Actions

The workflow in `.github/workflows/docker-image.yml` runs on pushes to the
`release` branch and can also be started manually with `workflow_dispatch`.

### Docker Image

The `build-and-push` job builds the Docker image and pushes it to GitHub
Container Registry:

```text
ghcr.io/<owner>/schemaview:latest
ghcr.io/<owner>/schemaview:<commit-sha>
```

### Local Windows Package

The `build-local-windows` job creates a self-contained `win-x64` publish with
the Angular production build already copied into `wwwroot`.

The published folder is compressed with 7-Zip ultra settings:

```text
7z a -t7z SchemaView-local-win-x64.7z <publish-folder> -mx=9 -m0=LZMA2 -mmt=on -ms=on
```

The workflow uploads the package as an Actions artifact named:

```text
SchemaView-local-win-x64-<commit-sha>
```

Download the artifact from the completed workflow run, extract the `.7z`, and
run `SchemaView.API.exe`.

## Database Support

| Database   | Status                |
| ---------- | --------------------- |
| PostgreSQL | Supported             |
| Oracle     | Supported             |
| SQL Server | Planned               |
| MySQL      | Planned               |

## Security Notes

Connection details are stored in browser local storage. Use this application in
trusted development environments and avoid storing production credentials in the
browser.

Dynamic table access validates selected columns for sorting before generating
SQL order clauses. Continue to validate schema, table, and column inputs as new
database features are added.

## License

SchemaView is licensed under the MIT License. See [LICENSE](LICENSE) for details.
