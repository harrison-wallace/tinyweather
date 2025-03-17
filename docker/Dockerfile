# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY src/ src/
COPY public/ public/
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE ${PORT:-3000} 
ENV PORT=${PORT:-3000} 
CMD ["sh", "-c", "npx serve -s dist -l $PORT"]