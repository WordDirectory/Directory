FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your server runs on
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"] 