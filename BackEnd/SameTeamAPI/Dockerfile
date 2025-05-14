# Use base ASP.NET image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["SameTeamAPI.csproj", "./"]
RUN dotnet restore "./SameTeamAPI.csproj"

COPY . .
RUN dotnet publish "SameTeamAPI.csproj" -c Release -o /app/publish

# Final image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SameTeamAPI.dll"]
