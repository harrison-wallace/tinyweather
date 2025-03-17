# Build stage
FROM node:18 AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY src/ src/
COPY public/ public/
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js ./

# Debug: List contents of /app/public/ to verify index.html is there
RUN ls -la /app/public/

# Build the app
RUN npm run build

# Runtime stage
FROM node:18-slim
WORKDIR /app

# Install serve globally for production
RUN npm install -g serve

# Copy the built dist directory from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Serve the app
CMD ["sh", "-c", "serve -s dist/public -l $PORT"]