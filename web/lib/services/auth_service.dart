import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';
import 'config_service.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  static const String _expiryKey = 'jwt_expiry';

  static String? _cachedToken;
  static DateTime? _cachedExpiry;

  // Get the API base URL from config
  static String get _baseUrl {
    return ConfigService.apiUrl;
  }

  // Login with username and password
  static Future<bool> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final token = data['access_token'] as String?;

        if (token != null) {
          await _storeToken(token);
          return true;
        }
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  // Store JWT token and extract expiry
  static Future<void> _storeToken(String token) async {
    final storage = StorageService.instance;

    // Store the token
    await storage.setString(_tokenKey, token);
    _cachedToken = token;

    // Extract expiry from JWT payload
    try {
      final parts = token.split('.');
      if (parts.length == 3) {
        // Decode the payload (second part)
        final payload = parts[1];
        // Add padding if needed
        final normalizedPayload = payload.padRight(
          (payload.length + 3) ~/ 4 * 4, 
          '='
        );

        final decodedBytes = base64Url.decode(normalizedPayload);
        final decodedPayload = jsonDecode(utf8.decode(decodedBytes));

        if (decodedPayload['exp'] != null) {
          final expiry = DateTime.fromMillisecondsSinceEpoch(
            decodedPayload['exp'] * 1000
          );
          await storage.setString(_expiryKey, expiry.toIso8601String());
          _cachedExpiry = expiry;
        }
      }
    } catch (e) {
      print('Error extracting token expiry: $e');
    }
  }

  // Get stored JWT token
  static Future<String?> getToken() async {
    if (_cachedToken != null && await isTokenValid()) {
      return _cachedToken;
    }

    final storage = StorageService.instance;
    final token = await storage.getString(_tokenKey);

    if (token != null && await isTokenValid()) {
      _cachedToken = token;
      return token;
    }

    return null;
  }

  // Check if token is valid (exists and not expired)
  static Future<bool> isTokenValid() async {
    final storage = StorageService.instance;
    final token = _cachedToken ?? await storage.getString(_tokenKey);

    if (token == null) return false;

    // Check expiry
    final expiryString = await storage.getString(_expiryKey);
    if (expiryString != null) {
      final expiry = DateTime.parse(expiryString);
      _cachedExpiry = expiry;

      // Add 5 minute buffer before expiry
      if (DateTime.now().isAfter(expiry.subtract(const Duration(minutes: 5)))) {
        await logout();
        return false;
      }
    }

    return true;
  }

  // Check if user is authenticated
  static Future<bool> isAuthenticated() async {
    return await isTokenValid();
  }

  // Logout and clear stored token
  static Future<void> logout() async {
    final storage = StorageService.instance;
    await storage.remove(_tokenKey);
    await storage.remove(_expiryKey);
    _cachedToken = null;
    _cachedExpiry = null;
  }

  // Get authorization header for API requests
  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    if (token != null) {
      return {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  // Make authenticated HTTP request
  static Future<http.Response> authenticatedRequest(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await getAuthHeaders();
    final uri = Uri.parse('$_baseUrl$endpoint');

    switch (method.toUpperCase()) {
      case 'GET':
        return await http.get(uri, headers: headers);
      case 'POST':
        return await http.post(
          uri,
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
      case 'PUT':
        return await http.put(
          uri,
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
      case 'DELETE':
        return await http.delete(uri, headers: headers);
      default:
        throw ArgumentError('Unsupported HTTP method: $method');
    }
  }
}
