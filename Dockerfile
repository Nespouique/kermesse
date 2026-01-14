# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install OpenSSL for Prisma to detect the correct version
RUN apk add --no-cache openssl openssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Generate Prisma client with explicit OpenSSL 3 target
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x
RUN npx prisma generate

# Copy source code
COPY . .

# Build Nuxt
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL 3 for Prisma runtime
RUN apk add --no-cache openssl

# Copy Prisma schema and generated client from build
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
