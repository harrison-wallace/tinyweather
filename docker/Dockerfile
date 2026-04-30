# Build stage
FROM node:20 AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev).
# Use `npm ci` for a clean, reproducible install — avoids the npm optional-deps
# bug (https://github.com/npm/cli/issues/4828) that drops native bindings like
# @tailwindcss/oxide on Linux.
COPY package.json package-lock.json ./
RUN npm ci

# Copy index.html from the project root into the container
COPY index.html ./

# Copy source files and other configuration files
COPY src/ src/
COPY public/ public/
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js ./

# Optional: Debug step to verify files
RUN ls -la /app

# Build the app
RUN npm run build

# Runtime stage
FROM node:20-slim
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
CMD ["sh", "-c", "serve -s dist -l $PORT"]
