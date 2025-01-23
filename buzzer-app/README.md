# Twitter Buzzer App 🎮

Eine leichtgewichtige React.js-Anwendung, die zufällige Tweets von einem bestimmten Twitter-Account anzeigt.

## Features

- Buzzer-Button mit Animationseffekten
- Rate-Limiting und Caching für Twitter API
- Single-Container Docker-Setup
- Responsives Design

## Setup

1. Erstelle eine `.env`-Datei basierend auf `.env.example`:
```bash
cp .env.example .env
```

2. Füge deine Twitter API-Credentials in die `.env`-Datei ein:
```env
TWITTER_USERNAME=your_twitter_username
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_MAX_RESULTS=50
PORT=3000
```

3. Starte die Anwendung mit Docker:
```bash
docker-compose up --build
```

4. Öffne die Anwendung im Browser:
```
http://localhost:3005
```

## Entwicklung

- Frontend: React.js mit CSS-Animationen
- Backend: Express.js mit Twitter API Integration
- Container: Docker mit Multi-Stage Build
- Cache: Server-seitiges Caching (60s) und Rate-Limiting

## Notizen

- Twitter API Rate-Limiting: 15 Sekunden Cooldown
- Client-seitiger Cooldown: 5 Sekunden
- Cache-Dauer: 60 Sekunden