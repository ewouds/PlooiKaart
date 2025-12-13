FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the server
RUN npm run build:server

# Remove devDependencies to keep image small
RUN npm prune --production

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
