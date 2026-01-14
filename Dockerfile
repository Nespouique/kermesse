# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and prisma config
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies (ignore scripts to avoid prisma generate needing DATABASE_URL)
RUN npm ci --legacy-peer-deps --ignore-scripts

# Manually run nuxt prepare
RUN npx nuxt prepare

# Generate Prisma client with a dummy DATABASE_URL (only needed for schema parsing)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy source code
COPY . .

# Build Nuxt
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy Prisma schema, config and generated client from build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/server/generated ./server/generated
# Copy all node_modules for Prisma Studio dependencies
COPY --from=build /app/node_modules ./node_modules

# Copy built Nuxt output
COPY --from=build /app/.output ./.output

# Expose port
EXPOSE 3000

# Start server
CMD ["node", ".output/server/index.mjs"]
