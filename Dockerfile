# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files (bao gồm .env)
COPY . .

# Build project using Babel
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Copy built code & package files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Copy file .env nếu dùng dotenv
COPY --from=builder /app/.env .env

# Install only production dependencies
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV BUILD_MODE=production

EXPOSE 8017

# Start server
CMD ["node", "build/src/server.js"]
