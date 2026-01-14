# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build Nuxt
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install production dependencies (skip postinstall)
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts

# Copy Prisma schema and generated client
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma

# Copy built Nuxt output
COPY --from=build /app/.output ./.output

# Replace Nuxt's bundled Prisma client with the correctly generated one
RUN rm -rf .output/server/node_modules/.prisma && \
    cp -r node_modules/.prisma .output/server/node_modules/.prisma

# Expose port
EXPOSE 3000

# Start server
CMD ["node", ".output/server/index.mjs"]
