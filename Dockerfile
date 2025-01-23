# Base python image
FROM python:3.11-alpine as base
RUN apk add --no-cache bash

# Backend build stage
FROM base as backend-builder
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --user -r requirements.txt
COPY backend .

# Frontend build stage remains unchanged
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Backend production stage
FROM base as backend
WORKDIR /app/backend
COPY --from=backend-builder /root/.local /root/.local
COPY --from=backend-builder /app/backend .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "server:app"]

# Frontend production stage
FROM nginx:alpine as frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]