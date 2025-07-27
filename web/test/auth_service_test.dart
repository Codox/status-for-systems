import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/services.dart';
import '../lib/services/auth_service.dart';
import '../lib/services/storage_service.dart';

void main() {
  group('AuthService Tests', () {
    setUp(() {
      // Reset any cached values before each test
      TestWidgetsFlutterBinding.ensureInitialized();
    });

    test('should not throw MissingPluginException when calling isAuthenticated', () async {
      // This test verifies that the MissingPluginException is resolved
      expect(() async => await AuthService.isAuthenticated(), returnsNormally);
      
      final result = await AuthService.isAuthenticated();
      expect(result, isA<bool>());
    });

    test('should not throw MissingPluginException when calling getToken', () async {
      expect(() async => await AuthService.getToken(), returnsNormally);
      
      final result = await AuthService.getToken();
      expect(result, anyOf(isNull, isA<String>()));
    });

    test('should not throw MissingPluginException when calling getAuthHeaders', () async {
      expect(() async => await AuthService.getAuthHeaders(), returnsNormally);
      
      final result = await AuthService.getAuthHeaders();
      expect(result, isA<Map<String, String>>());
      expect(result['Content-Type'], equals('application/json'));
    });

    test('should not throw MissingPluginException when calling logout', () async {
      expect(() async => await AuthService.logout(), returnsNormally);
    });

    test('StorageService should work correctly', () async {
      final storage = StorageService.instance;
      
      // Test setting and getting a value
      await storage.setString('test_key', 'test_value');
      final value = await storage.getString('test_key');
      expect(value, equals('test_value'));
      
      // Test removing a value
      await storage.remove('test_key');
      final removedValue = await storage.getString('test_key');
      expect(removedValue, isNull);
    });

    test('should handle token validation without exceptions', () async {
      // Clear any existing tokens first
      await AuthService.logout();
      
      // Should return false when no token exists
      final isValid = await AuthService.isTokenValid();
      expect(isValid, isFalse);
      
      // Should return false when not authenticated
      final isAuth = await AuthService.isAuthenticated();
      expect(isAuth, isFalse);
    });
  });
}