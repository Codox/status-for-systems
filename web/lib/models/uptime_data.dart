import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

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

// Data service for fetching and processing uptime data
class UptimeDataService {
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

}
