FROM node:20-alpine

WORKDIR /app

# Configure npm to handle SSL issues in Docker environments
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/

# Copy package files and workspace dependencies
COPY apps/landing/package*.json ./
COPY packages/schemas ./packages/schemas/

# Create a temporary package.json with resolved workspace dependencies
# Replace "workspace:*" with "file:packages/schemas" for the schemas dependency
RUN sed 's/"@paralegal-ai\/schemas": "workspace:\*"/"@paralegal-ai\/schemas": "file:packages\/schemas"/g' package.json > package.json.tmp && \
    mv package.json.tmp package.json

# Install dependencies with npm
RUN npm install --legacy-peer-deps

# Copy application code
COPY apps/landing/ .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set correct ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

CMD ["npm", "start"]