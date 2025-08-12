import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ConfigService {
  static Map<String, dynamic> _config = {};
  static bool _isLoaded = false;

  // Load configuration from config.json
  static Future<void> loadConfig() async {
    if (_isLoaded) return;

    if (kIsWeb) {
      try {
        final response = await http.get(Uri.parse('/config.json'));
        if (response.statusCode == 200) {
          _config = json.decode(response.body);
          _isLoaded = true;
        } else {
          throw Exception('Failed to load config.json: ${response.statusCode}');
        }
      } catch (e) {
        print('Error loading config.json: $e');
        // Set default values if config loading fails
        _config = {
          'apiUrl': '/api',
          'siteTitle': 'Status Dashboard',
        };
        _isLoaded = true;
      }
    } else {
      // For non-web platforms, you might load from assets or other sources
      _config = {
        'apiUrl': 'https://api.statusforsystems.com',
        'siteTitle': 'Status Dashboard',
      };
      _isLoaded = true;
    }
  }

  // Get API URL
  static String get apiUrl {
    if (!_isLoaded) {
      throw Exception('Config not loaded. Call ConfigService.loadConfig() first.');
    }
    return _config['apiUrl'] ?? 'https://api.statusforsystems.com';
  }

  // Get site title
  static String get siteTitle {
    if (!_isLoaded) {
      throw Exception('Config not loaded. Call ConfigService.loadConfig() first.');
    }
    return _config['siteTitle'] ?? 'Status Dashboard';
  }

  // Get any config value by key
  static dynamic getValue(String key, [dynamic defaultValue]) {
    if (!_isLoaded) {
      throw Exception('Config not loaded. Call ConfigService.loadConfig() first.');
    }
    return _config[key] ?? defaultValue;
  }

  // Check if config is loaded
  static bool get isLoaded => _isLoaded;

  // Get all config values
  static Map<String, dynamic> get config => Map.from(_config);
}