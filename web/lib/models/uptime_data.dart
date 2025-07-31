import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';

// Legacy model - keeping for backward compatibility
class Service {
  final String name;
  final String status; // 'up', 'down', 'degraded'
  final double uptime; // Percentage (0-100)
  final List<UptimeRecord> history;

  Service({
    required this.name,
    required this.status,
    required this.uptime,
    required this.history,
  });
}

class UptimeRecord {
  final DateTime timestamp;
  final double responseTime; // in milliseconds
  final String status; // 'up', 'down', 'degraded'

  UptimeRecord({
    required this.timestamp,
    required this.responseTime,
    required this.status,
  });
}

// New models based on the React component structure
class Component {
  final String id;
  final String name;
  final String description;
  final String status; // 'operational', 'degraded', 'partial', 'major', 'under_maintenance'
  final String createdAt;
  final String updatedAt;

  Component({
    required this.id,
    required this.name,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });
}

class Group {
  final String id;
  final String name;
  final String description;
  final List<Component> components;
  final String createdAt;
  final String updatedAt;

  Group({
    required this.id,
    required this.name,
    required this.description,
    required this.components,
    required this.createdAt,
    required this.updatedAt,
  });
}

class Incident {
  final String id;
  final String title;
  final String description;
  final String status; // 'investigating', 'identified', 'monitoring', 'resolved'
  final String impact; // 'critical', 'major', 'minor', 'none'
  final List<AffectedComponent> affectedComponents;
  final String createdAt;
  final String updatedAt;
  final String? resolvedAt;

  Incident({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.impact,
    required this.affectedComponents,
    required this.createdAt,
    required this.updatedAt,
    this.resolvedAt,
  });
}

class AffectedComponent {
  final String id;
  final String name;
  final String status;

  AffectedComponent({
    required this.id,
    required this.name,
    required this.status,
  });
}

class StatusUpdate {
  final String? from;
  final String to;

  StatusUpdate({
    this.from,
    required this.to,
  });
}

class ImpactUpdate {
  final String from;
  final String to;

  ImpactUpdate({
    required this.from,
    required this.to,
  });
}

class ComponentStatusUpdate {
  final String id;
  final String from;
  final String to;
  final String updateId;

  ComponentStatusUpdate({
    required this.id,
    required this.from,
    required this.to,
    required this.updateId,
  });
}

class Update {
  final String id;
  final String type;
  final String? description;
  final StatusUpdate? statusUpdate;
  final ImpactUpdate? impactUpdate;
  final List<ComponentStatusUpdate>? componentStatusUpdates;
  final String createdAt;

  Update({
    required this.id,
    required this.type,
    this.description,
    this.statusUpdate,
    this.impactUpdate,
    this.componentStatusUpdates,
    required this.createdAt,
  });
}

// Data service for fetching and processing uptime data
class UptimeDataService {
  // Helper method for authenticated requests
  static Future<http.Response> _fetchWithAuth(String url, {String method = 'GET', Map<String, String>? headers, String? body}) async {
    // Check if token is valid, if not this will throw an exception
    final token = await AuthService.getToken();
    if (token == null) {
      throw Exception('Authentication token not available. Please login again.');
    }

    final defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    final finalHeaders = {...defaultHeaders, ...?headers};

    try {
      http.Response response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(Uri.parse(url), headers: finalHeaders);
          break;
        case 'POST':
          response = await http.post(Uri.parse(url), headers: finalHeaders, body: body);
          break;
        case 'PUT':
          response = await http.put(Uri.parse(url), headers: finalHeaders, body: body);
          break;
        case 'DELETE':
          response = await http.delete(Uri.parse(url), headers: finalHeaders);
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }

      // Check if the response indicates token expiration (401 Unauthorized)
      if (response.statusCode == 401) {
        // Token has expired, logout and throw exception
        await AuthService.logout();
        throw Exception('Authentication token expired. Please login again.');
      }

      return response;
    } catch (e) {
      // If it's an authentication error, make sure to logout
      if (e.toString().contains('Authentication token')) {
        await AuthService.logout();
      }
      rethrow;
    }
  }
  // API data fetching methods
  static Future<List<Group>> fetchGroups() async {
    try {
      // Get API URL from .env file, or use a default value
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await http.get(
        Uri.parse('$apiUrl/public/groups'),
        headers: {
          'Accept': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch groups: ${response.statusCode}');
      }

      final List<dynamic> data = jsonDecode(response.body);
      return data.map((group) => Group(
        id: group['_id'],
        name: group['name'],
        description: group['description'],
        components: (group['components'] as List<dynamic>).map((component) => Component(
          id: component['_id'],
          name: component['name'],
          description: component['description'],
          status: component['status'],
          createdAt: component['createdAt'],
          updatedAt: component['updatedAt'],
        )).toList(),
        createdAt: group['createdAt'],
        updatedAt: group['updatedAt'],
      )).toList();
    } catch (error) {
      print('Error fetching groups data: $error');
      // Try one more time before returning empty list
      try {
        print('Retrying groups data fetch...');
        final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';

        final response = await http.get(
          Uri.parse('$apiUrl/public/groups'),
          headers: {
            'Accept': 'application/json',
          },
        );

        if (response.statusCode == 200) {
          final List<dynamic> data = jsonDecode(response.body);
          return data.map((group) => Group(
            id: group['_id'],
            name: group['name'],
            description: group['description'],
            components: (group['components'] as List<dynamic>).map((component) => Component(
              id: component['_id'],
              name: component['name'],
              description: component['description'],
              status: component['status'],
              createdAt: component['createdAt'],
              updatedAt: component['updatedAt'],
            )).toList(),
            createdAt: group['createdAt'],
            updatedAt: group['updatedAt'],
          )).toList();
        } else {
          throw Exception('Retry failed with status code: ${response.statusCode}');
        }
      } catch (retryError) {
        print('Retry failed: $retryError');
        print('Returning empty list for groups');
        return [];
      }
    }
  }

  static Future<List<Incident>> fetchActiveIncidents() async {
    try {
      // Get API URL from .env file, or use a default value
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await http.get(
        Uri.parse('$apiUrl/public/incidents'),
        headers: {
          'Accept': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch incidents: ${response.statusCode}');
      }

      final List<dynamic> data = jsonDecode(response.body);
      // Filter out resolved incidents to show only active ones
      return data
        .where((incident) => incident['status'] != 'resolved')
        .map((incident) => Incident(
          id: incident['_id'],
          title: incident['title'],
          description: incident['description'],
          status: incident['status'],
          impact: incident['impact'],
          affectedComponents: (incident['affectedComponents'] as List<dynamic>).map((component) => AffectedComponent(
            id: component['_id'],
            name: component['name'],
            status: component['status'],
          )).toList(),
          createdAt: incident['createdAt'],
          updatedAt: incident['updatedAt'],
          resolvedAt: incident['resolvedAt'],
        )).toList();
    } catch (error) {
      print('Error fetching incidents: $error');
      // Try one more time before returning empty list
      try {
        print('Retrying incidents data fetch...');
        final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';

        final response = await http.get(
          Uri.parse('$apiUrl/public/incidents'),
          headers: {
            'Accept': 'application/json',
          },
        );

        if (response.statusCode == 200) {
          final List<dynamic> data = jsonDecode(response.body);
          // Filter out resolved incidents to show only active ones
          return data
            .where((incident) => incident['status'] != 'resolved')
            .map((incident) => Incident(
              id: incident['_id'],
              title: incident['title'],
              description: incident['description'],
              status: incident['status'],
              impact: incident['impact'],
              affectedComponents: (incident['affectedComponents'] as List<dynamic>).map((component) => AffectedComponent(
                id: component['_id'],
                name: component['name'],
                status: component['status'],
              )).toList(),
              createdAt: incident['createdAt'],
              updatedAt: incident['updatedAt'],
              resolvedAt: incident['resolvedAt'],
            )).toList();
        } else {
          throw Exception('Retry failed with status code: ${response.statusCode}');
        }
      } catch (retryError) {
        print('Retry failed: $retryError');
        print('Returning empty list for incidents');
        return [];
      }
    }
  }

  static Future<Incident> fetchIncident(String incidentId) async {
    try {
      // Get API URL from .env file, or use a default value
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await http.get(
        Uri.parse('$apiUrl/public/incidents/$incidentId'),
        headers: {
          'Accept': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch incident: ${response.statusCode}');
      }

      final dynamic data = jsonDecode(response.body);
      return Incident(
        id: data['_id'],
        title: data['title'],
        description: data['description'],
        status: data['status'],
        impact: data['impact'],
        affectedComponents: (data['affectedComponents'] as List<dynamic>).map((component) => AffectedComponent(
          id: component['_id'],
          name: component['name'],
          status: component['status'],
        )).toList(),
        createdAt: data['createdAt'],
        updatedAt: data['updatedAt'],
        resolvedAt: data['resolvedAt'],
      );
    } catch (error) {
      print('Error fetching incident: $error');
      rethrow;
    }
  }

  static Future<List<Update>> fetchIncidentUpdates(String incidentId) async {
    try {
      // Get API URL from .env file, or use a default value
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await http.get(
        Uri.parse('$apiUrl/public/incidents/$incidentId/updates'),
        headers: {
          'Accept': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch updates: ${response.statusCode}');
      }

      final List<dynamic> data = jsonDecode(response.body);
      return data.map((update) => Update(
        id: update['_id'],
        type: update['type'],
        description: update['description'],
        statusUpdate: update['statusUpdate'] != null ? StatusUpdate(
          from: update['statusUpdate']['from'],
          to: update['statusUpdate']['to'],
        ) : null,
        impactUpdate: update['impactUpdate'] != null ? ImpactUpdate(
          from: update['impactUpdate']['from'],
          to: update['impactUpdate']['to'],
        ) : null,
        componentStatusUpdates: update['componentStatusUpdates'] != null 
          ? (update['componentStatusUpdates'] as List<dynamic>).map((compUpdate) => ComponentStatusUpdate(
              id: compUpdate['id'],
              from: compUpdate['from'],
              to: compUpdate['to'],
              updateId: compUpdate['_id'],
            )).toList()
          : null,
        createdAt: update['createdAt'],
      )).toList();
    } catch (error) {
      print('Error fetching incident updates: $error');
      rethrow;
    }
  }

  // Admin API methods
  static Future<Incident> updateIncident({
    required String incidentId,
    required String status,
    required String impact,
    required String description,
    required List<Map<String, String>> componentUpdates,
  }) async {
    try {
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      // Create the update
      final response = await _fetchWithAuth(
        '$apiUrl/admin/incidents/updates',
        method: 'POST',
        body: jsonEncode({
          'incidentId': incidentId,
          'status': status,
          'impact': impact,
          'description': description,
          'componentUpdates': componentUpdates,
        }),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to update incident: ${response.statusCode}');
      }

      // The update response contains update data, not full incident data
      // So we need to fetch the updated incident separately
      final updatedIncident = await fetchAdminIncident(incidentId);
      return updatedIncident;
    } catch (error) {
      print('Error updating incident: $error');
      rethrow;
    }
  }

  static Future<void> closeIncident(String incidentId) async {
    try {
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await _fetchWithAuth(
        '$apiUrl/admin/incidents/$incidentId/resolve',
        method: 'POST',
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to close incident: ${response.statusCode}');
      }
    } catch (error) {
      print('Error closing incident: $error');
      rethrow;
    }
  }

  static Future<Incident> fetchAdminIncident(String incidentId) async {
    try {
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await _fetchWithAuth('$apiUrl/admin/incidents/$incidentId');

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch incident: ${response.statusCode}');
      }

      final dynamic data = jsonDecode(response.body);
      return Incident(
        id: data['_id'],
        title: data['title'],
        description: data['description'],
        status: data['status'],
        impact: data['impact'],
        affectedComponents: (data['affectedComponents'] as List<dynamic>).map((component) => AffectedComponent(
          id: component['_id'],
          name: component['name'],
          status: component['status'],
        )).toList(),
        createdAt: data['createdAt'],
        updatedAt: data['updatedAt'],
        resolvedAt: data['resolvedAt'],
      );
    } catch (error) {
      print('Error fetching admin incident: $error');
      rethrow;
    }
  }

  static Future<List<Update>> fetchAdminIncidentUpdates(String incidentId) async {
    try {
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await _fetchWithAuth('$apiUrl/admin/incidents/$incidentId/updates');

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch updates: ${response.statusCode}');
      }

      final List<dynamic> data = jsonDecode(response.body);
      return data.map((update) => Update(
        id: update['_id'],
        type: update['type'],
        description: update['description'],
        statusUpdate: update['statusUpdate'] != null ? StatusUpdate(
          from: update['statusUpdate']['from'],
          to: update['statusUpdate']['to'],
        ) : null,
        impactUpdate: update['impactUpdate'] != null ? ImpactUpdate(
          from: update['impactUpdate']['from'],
          to: update['impactUpdate']['to'],
        ) : null,
        componentStatusUpdates: update['componentStatusUpdates'] != null 
          ? (update['componentStatusUpdates'] as List<dynamic>).map((compUpdate) => ComponentStatusUpdate(
              id: compUpdate['id'],
              from: compUpdate['from'],
              to: compUpdate['to'],
              updateId: compUpdate['_id'],
            )).toList()
          : null,
        createdAt: update['createdAt'],
      )).toList();
    } catch (error) {
      print('Error fetching admin incident updates: $error');
      rethrow;
    }
  }

  static Future<List<Component>> fetchAllComponents() async {
    try {
      final apiUrl = dotenv.env['API_URL'] ?? 'https://api.statusforsystems.com';
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      final response = await _fetchWithAuth('$apiUrl/admin/components');

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch components: ${response.statusCode}');
      }

      final List<dynamic> data = jsonDecode(response.body);
      return data.map((component) => Component(
        id: component['_id'],
        name: component['name'],
        description: component['description'],
        status: component['status'],
        createdAt: component['createdAt'],
        updatedAt: component['updatedAt'],
      )).toList();
    } catch (error) {
      print('Error fetching components: $error');
      rethrow;
    }
  }

}
