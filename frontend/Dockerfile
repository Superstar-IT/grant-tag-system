# Multi-stage build for React app
FROM node:18-alpine as build-stage

# Set working directory
WORKDIR /app/frontend

# Copy package files first for better caching
COPY package*.json /app/frontend

# Install dependencies
RUN npm install

# Copy all source files
COPY . /app/frontend

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine as production-stage

# Copy built app from build stage
COPY --from=build-stage /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]