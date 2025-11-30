# Status for Systems

A full-stack system status monitoring application.

**Warning:** This project is heavily in-inprogress and is not yet ready for production use.

Website: https://statusfor.systems/

Demo: https://demo.statusfor.systems/

## Prerequisites
- Docker
- Node.js >= v20.0.0
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
   docker run -d -p 3000:3000 \
   -e MONGODB_URI="mongodb://admin:admin@localhost:27017/status_for_systems" \
   -e JWT_SECRET="<YOUR_JWT_SECRET>" \
   -e NEXT_PUBLIC_DASHBOARD_TITLE="Rexchopper's Status Page" \
   -e NEXT_PUBLIC_DASHBOARD_DESCRIPTION="Find out if something is broken here"
   ghcr.io/codox/status-for-systems:<VERSION>
   ```

4. Access the status page at `http://localhost:3000`. The admin panel is available at `http://localhost:3000/admin`. Use the credentials set in the environment variables for authentication.

## Project Structure

- **app/**: Next.js full-stack application (frontend and API routes)
- **docs/**: MKDocs documentation

## Development

Navigate to the `app/` directory and follow the instructions on the [README](./app/README.md)

## Contributing
Contributions are welcome! Please read the [CONTRIBUTING](./CONTRIBUTING.md) guide for details on how to contribute to this project.

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Credits
- Thank you to [jcsix694](https://github.com/jcsix694) at [discovery.onl](https://discovery.onl) for becoming the initial Beta client 
