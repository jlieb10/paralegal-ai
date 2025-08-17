FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/landing/package*.json ./
COPY packages/schemas ./packages/schemas

# Install dependencies
RUN npm install

# Copy application code
COPY apps/landing/ .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set correct ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

CMD ["npm", "start"]