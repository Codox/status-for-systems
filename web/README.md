# Status for Systems - Web

## Development Setup

1. Make sure you have Flutter installed and set up on your machine.

2. Navigate to the project directory:
   ```
   cd status-for-systems/web
   ```

3. Install dependencies:
   ```
   flutter pub get
   ```

4. Run the application:
   ```
   flutter run -d chrome
   ```

## Environment Variables

This project uses environment variables for configuration. For development, a `.env` file has been created with the following variables:

- `API_URL`: The URL of the API server (default: http://localhost:3000)

**Important**: For web builds, there are two `.env` files that need to be kept in sync:
1. The main `.env` file in the project root directory
2. A copy in the `web/.env` file for web builds

If you change the API URL or add new environment variables, make sure to update both files.

To use a different API URL, you can modify both `.env` files or set the environment variable at runtime:

```
flutter run -d chrome --dart-define=API_URL=https://your-api-url.com
```

## Building for Production

To build the application for production, run:

```
flutter build web
```

This will create a production build in the `build/web` directory.

## Resources

- [Flutter documentation](https://docs.flutter.dev/)
- [Dart documentation](https://dart.dev/guides)
