# Multi-stage build: compile the Vite app with Node, then serve via Nginx

FROM node:20-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app

# Install dependencies (both production and build-time) and compile assets
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
# Remove default nginx static assets and replace with our build output
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
