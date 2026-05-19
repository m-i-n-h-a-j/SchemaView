FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY SchemaView.slnx ./

COPY src/SchemaView.API/SchemaView.API.csproj src/SchemaView.API/
COPY src/SchemaView.Application/SchemaView.Application.csproj src/SchemaView.Application/
COPY src/SchemaView.Domain/SchemaView.Domain.csproj src/SchemaView.Domain/
COPY src/SchemaView.Infrastructure/SchemaView.Infrastructure.csproj src/SchemaView.Infrastructure/

RUN dotnet restore src/SchemaView.API/SchemaView.API.csproj

FROM node:24-alpine AS ui-build
WORKDIR /ui

COPY src/SchemaView.UI/package*.json ./
RUN npm ci

COPY src/SchemaView.UI/ ./
RUN npx ng build --configuration=production --base-href=/ --deploy-url=/

FROM build AS publish

COPY . .
RUN dotnet publish src/SchemaView.API/SchemaView.API.csproj -c Release -o /app/publish

RUN rm -rf /app/publish/wwwroot
COPY --from=ui-build /ui/dist/SchemaView.UI/browser/ /app/publish/wwwroot/

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ARG REPOSITORY_URL
ARG IMAGE_DESCRIPTION="SchemaView API and Angular UI"

LABEL org.opencontainers.image.source=$REPOSITORY_URL
LABEL org.opencontainers.image.description=$IMAGE_DESCRIPTION

COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "SchemaView.API.dll"]
