# Status for Systems

A full-stack system status monitoring application.

**Warning:** This project is heavily in-inprogress and is not yet ready for production use.

Website: https://statusfor.systems/

Demo: https://demo.statusfor.systems/

## Prerequisites
- Docker
- Flutter SDK
- Node.js v20.0.0 or higher
- MongoDB (local or Docker)

## Quick Start

See Releases for available versions.

1. Generate a JWT secret by running:
   ```bash
   openssl rand -base64 32
   ```

2. Pull the Docker image:
   ```bash
   docker pull ghcr.io/codox/status-for-systems:<VERSION>
   ```
   Replace `<VERSION>` with the desired version tag.

3. Run the Docker container:
   ```bash
   docker run -d -p 8080:80 \
   -e MONGODB_URI="mongodb://localhost:27017/status-for-systems" \
   -e MONGODB_USER=admin \
   -e MONGODB_PASSWORD=admin \
   -e BASIC_AUTH_USERNAME=admin \
   -e BASIC_AUTH_PASSWORD=admin \
   -e JWT_SECRET=<YOUR_JWT_SECRET> \
   -e WEB_API_URL="/api" \
   -e WEB_SITE_TITLE="Status for Systems"
   ghcr.io/codox/status-for-systems:<VERSION>
   ```

4. Access the status page at `http://localhost:8080`. The admin panel is available at `http://localhost:8080/admin`. Use the credentials set in the environment variables for authentication.

## Project Structure

- **web/**: Flutter web app
- **server/**: NestJS API
- **docs/**: MKDocs documentation

## Development

1. See [`web/README.md`](./web/README.md) for frontend setup, dependencies, and usage.
2. See [`server/README.md`](./server/README.md) for backend setup, dependencies, and usage.

## Contributing
Contributions are welcome! Please read the [CONTRIBUTING](./CONTRIBUTING.md) guide for details on how to contribute to this project.

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Credits
A big thank you to [jcsix694](https://github.com/jcsix694) at [discovery.onl](https://discovery.onl) for supporting as the first Beta client.
