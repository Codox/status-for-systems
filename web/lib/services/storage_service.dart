import 'dart:async';
import 'package:flutter/foundation.dart';

// Conditional imports for different platforms
import 'storage_service_stub.dart'
    if (dart.library.html) 'storage_service_web.dart'
    if (dart.library.io) 'storage_service_mobile.dart';

abstract class StorageService {
  static StorageService? _instance;
  
  static StorageService get instance {
    _instance ??= createStorageService();
    return _instance!;
  }

  Future<void> setString(String key, String value);
  Future<String?> getString(String key);
  Future<void> remove(String key);
  Future<void> clear();
}