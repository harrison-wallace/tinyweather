# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the Docker container
WORKDIR /app

# Add argument for environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies - always install dev dependencies first, then prune for prod
RUN npm install
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm prune --production; \
    fi

# Install serve for production static serving
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm install -g serve; \
    fi

# Copy the rest of the application code to the working directory
COPY src/ src/
COPY public/ public/
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js ./

# Build the React application for production
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm run build; \
    fi

# Make port configurable via environment variable
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Command to run the application based on environment
CMD if [ "$NODE_ENV" = "development" ]; then \
        npm run dev -- --host 0.0.0.0 --port ${PORT}; \
    else \
        serve -s dist -l ${PORT}; \
    fi