FROM node:20-slim

WORKDIR /app

# Copy package files
COPY apps/bridge/package*.json ./
COPY packages/schemas ./packages/schemas

# Install dependencies
RUN npm install --only=production

# Copy application code
COPY apps/bridge/src/ ./src/
COPY apps/bridge/nest-cli.json apps/bridge/tsconfig.json ./

# Build the application
RUN npm run build

# Create non-root user
RUN useradd --create-home --shell /bin/bash paralegal
RUN chown -R paralegal:paralegal /app
USER paralegal

# Environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8002/bridge/health || exit 1

EXPOSE 8002

CMD ["npm", "run", "start:prod"]