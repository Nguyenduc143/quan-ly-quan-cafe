# Docker Support (Tùy ch?n)

## Dockerfile cho Gateway

T?o file `Dockerfile` trong th? m?c `QuanlyCafe.API.Gateway`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["QuanlyCafe.API.Gateway/QuanlyCafe.API.Gateway.csproj", "QuanlyCafe.API.Gateway/"]
RUN dotnet restore "QuanlyCafe.API.Gateway/QuanlyCafe.API.Gateway.csproj"
COPY . .
WORKDIR "/src/QuanlyCafe.API.Gateway"
RUN dotnet build "QuanlyCafe.API.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QuanlyCafe.API.Gateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "QuanlyCafe.API.Gateway.dll"]
```

## Docker Compose (Toàn b? h? th?ng)

T?o file `docker-compose.yml` ? th? m?c root:

```yaml
version: '3.8'

services:
  admin-api:
    build:
      context: .
      dockerfile: QuanlyCafe.API.Admin/Dockerfile
    ports:
      - "5092:5092"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:5092
    networks:
      - cafe-network
    volumes:
      - ./appsettings.json:/app/appsettings.json:ro

  staff-api:
    build:
      context: .
      dockerfile: QuanlyCafe.API.Staff/Dockerfile
    ports:
      - "5229:5229"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:5229
    networks:
      - cafe-network
    volumes:
      - ./appsettings.json:/app/appsettings.json:ro

  gateway:
    build:
      context: .
      dockerfile: QuanlyCafe.API.Gateway/Dockerfile
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:5000
    depends_on:
      - admin-api
      - staff-api
    networks:
      - cafe-network

networks:
  cafe-network:
    driver: bridge
```

## Ch?y v?i Docker Compose

```bash
# Build và start t?t c? services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop t?t c? services
docker-compose down

# Rebuild và restart
docker-compose up -d --build
```

## L?u ý khi dùng Docker

1. Trong `ocelot.json`, thay ??i host t? `localhost` sang tên service:
```json
{
  "DownstreamHostAndPorts": [
    {
      "Host": "admin-api",  // Thay vì localhost
      "Port": 5092
    }
  ]
}
```

2. ??m b?o connection string trong `appsettings.json` có th? truy c?p t? Docker container

3. Network trong Docker Compose cho phép các container giao ti?p v?i nhau
