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

## Configuration

This project uses a `config.json` file for configuration. To set up your configuration:

1. Copy the example configuration file:
   ```
   cp config.json.example config.json
   ```

2. Edit `config.json` with your settings:
   - `siteTitle`: The title of your status page
   - `apiUrl`: The URL of the API server (default: http://localhost:3000)

Example `config.json`:
```json
{
  "siteTitle": "My Status Page",
  "apiUrl": "http://localhost:3000"
}
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
