FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001 \
    && chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000 || exit 1

EXPOSE 4000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4000"]