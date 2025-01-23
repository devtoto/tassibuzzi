# Stage 1: Build client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/public ./public
COPY client/src ./src
COPY client/package*.json ./
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server .

# Final stage
FROM node:18-alpine
WORKDIR /app
COPY --from=server-builder /app/server .
COPY --from=client-builder /app/client/build ./public

CMD ["node", "server.js"]