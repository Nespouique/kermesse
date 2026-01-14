# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and prisma config
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Generate Prisma client (Prisma 7 uses JS adapter, no binary needed)
RUN npx prisma generate

# Copy source code
COPY . .

# Build Nuxt
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy Prisma schema, config and generated client from build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/server/generated ./server/generated
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma

# Copy built Nuxt output
COPY --from=build /app/.output ./.output

# Expose port
EXPOSE 3000

# Start server
CMD ["node", ".output/server/index.mjs"]
