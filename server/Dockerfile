FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy rest of application
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
