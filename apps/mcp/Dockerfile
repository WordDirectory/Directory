FROM node:20-slim

WORKDIR /app

# Copy all source files first
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Expose the port your server runs on
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"] 