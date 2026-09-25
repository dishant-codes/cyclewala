# Skill: Docker

> Containerization standard.

## Multi-Stage Build

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Rules
- Pin versions (no `latest`)
- Multi-stage for smaller images
- `.dockerignore` mirrors `.gitignore` + node_modules
- Run as non-root user

## Memory Hooks
- Log base image choices + rationale
- Log build optimizations
