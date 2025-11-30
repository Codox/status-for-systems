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
    docker run -d -p 3000:3000 \
    -e MONGODB_URI="mongodb://admin:admin@localhost:27017/status_for_systems" \
    -e JWT_SECRET="<YOUR_JWT_SECRET>" \
    -e NEXT_PUBLIC_DASHBOARD_TITLE="Rexchopper's Status Page" \
    -e NEXT_PUBLIC_DASHBOARD_DESCRIPTION="Find out if something is broken here"
    ghcr.io/codox/status-for-systems:<VERSION>
    ```

4. Access the status page at `http://localhost:3000`. The admin panel is available at `http://localhost:3000/admin`. Use the credentials set in the environment variables for authentication.