import 'dart:async';
import 'dart:html' as html;
import 'storage_service.dart';

class WebStorageService implements StorageService {
  @override
  Future<void> setString(String key, String value) async {
    html.window.localStorage[key] = value;
  }

  @override
  Future<String?> getString(String key) async {
    return html.window.localStorage[key];
  }

  @override
  Future<void> remove(String key) async {
    html.window.localStorage.remove(key);
  }

  @override
  Future<void> clear() async {
    html.window.localStorage.clear();
  }
}

StorageService createStorageService() => WebStorageService();