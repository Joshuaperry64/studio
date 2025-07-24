# Use an official Node.js 18 image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install Firebase CLI globally within the image
RUN npm install -g firebase-tools

# Copy your project's dependency manifest
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your project's code into the container
COPY . .

# Expose the ports used by the Firebase Emulator Suite
EXPOSE 4000 5001 8080 9000 9099 9199

# The command to run when the container starts
# It logs into Firebase (using a token) and starts the emulators
CMD ["firebase", "emulators:start", "--import=./firebase-data", "--export-on-exit"]