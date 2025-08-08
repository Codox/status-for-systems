# Getting Started (End Users)

The application runs as a single container. This contains the UI, backend and NGINX server to serve the application.

## Prerequisites

- Docker
- MongoDB

## Setup
These instructions can also be found at: https://github.com/Codox/status-for-systems

1. Generate a JWT secret by running:

    ```bash
    openssl rand -base64 32
    ```

2. Pull the Docker image (Replace `<VERSION>` with the desired version tag):

    ```bash
    docker pull ghcr.io/codox/status-for-systems:<VERSION>
    ```

3. Run the Docker container:

    ```bash
    docker run -d -p 8080:80 \ 
    -e MONGODB_URI="mongodb://localhost:27017/status-for-systems" \
    -e MONGODB_USER=admin \
    -e MONGODB_PASSWORD=admin \
    -e BASIC_AUTH_USERNAME=admin \
    -e BASIC_AUTH_PASSWORD=admin \
    -e JWT_SECRET=<YOUR_JWT_SECRET> \
    ghcr.io/codox/status-for-systems:<VERSION>
    ```

4. Access the status page at
   `http://localhost:8080`. The admin panel is available at `http://localhost:8080/admin`. Use the credentials set in the environment variables for authentication.