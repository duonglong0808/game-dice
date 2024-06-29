# Stage 1: Build the application
FROM node:18 AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install dependencies
RUN yarn install --production && yarn cache clean

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN yarn build

# Stage 2: Run the application
FROM node:18-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Copy the build files from the previous stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

# Expose the port the app runs on
EXPOSE 9991

# Command to run the application
CMD ["node", "dist/main"]
