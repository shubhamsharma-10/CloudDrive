# Simple Dockerfile for Frontend
FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .



# Expose port
EXPOSE 5173
# Serve the built app
CMD ["npm", "run", "dev", "--", "--host"]
