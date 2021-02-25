FROM mcr.microsoft.com/dotnet/runtime:5.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["crudless.netcore.csproj", "./"]
RUN dotnet restore "crudless.netcore.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "crudless.netcore.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "crudless.netcore.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "crudless.netcore.dll"]
