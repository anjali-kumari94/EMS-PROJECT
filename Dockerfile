# STAGE 1: Build the React Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
# Copy frontend package files and install
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build it
COPY frontend/ ./
RUN npm run build 

# STAGE 2: Setup Node Backend
FROM node:20-alpine
WORKDIR /app/backend
# Copy backend package files and install
COPY backend/package*.json ./
RUN npm install --omit=dev
# Copy backend source code
COPY backend/ ./

# Copy the compiled React files from Stage 1 into the final container
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Start the backend server
EXPOSE 5000
CMD ["node", "server.js"]
