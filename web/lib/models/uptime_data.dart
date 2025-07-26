import 'dart:convert';
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

// Mock data generator for demonstration purposes
class MockDataGenerator {
  // API data fetching methods
  static Future<List<Group>> fetchGroups() async {
    try {
      // Using the provided JSON response for testing/development
      const String mockResponse = '''
[
  {
    "_id": "6883d9115ea05ff4c228e524",
    "name": "Core Infrastructure",
    "description": "Essential infrastructure components",
    "components": [
      {
        "_id": "6883d9115ea05ff4c228e51f",
        "name": "API Gateway",
        "description": "Main API gateway handling all incoming requests",
        "status": "major",
        "createdAt": "2025-07-25T19:20:49.933Z",
        "updatedAt": "2025-07-25T19:35:31.356Z"
      },
      {
        "_id": "6883d9115ea05ff4c228e521",
        "name": "Database Cluster",
        "description": "Primary database cluster",
        "status": "operational",
        "createdAt": "2025-07-25T19:20:49.933Z",
        "updatedAt": "2025-07-25T19:20:49.933Z"
      }
    ],
    "createdAt": "2025-07-25T19:20:49.940Z",
    "updatedAt": "2025-07-25T19:20:49.940Z"
  },
  {
    "_id": "6883d9115ea05ff4c228e525",
    "name": "Security Services",
    "description": "Security and authentication related services",
    "components": [
      {
        "_id": "6883d9115ea05ff4c228e520",
        "name": "Authentication Service",
        "description": "Handles user authentication and authorization",
        "status": "major",
        "createdAt": "2025-07-25T19:20:49.933Z",
        "updatedAt": "2025-07-25T19:21:59.367Z"
      }
    ],
    "createdAt": "2025-07-25T19:20:49.941Z",
    "updatedAt": "2025-07-25T19:20:49.941Z"
  },
  {
    "_id": "6883d9115ea05ff4c228e526",
    "name": "Performance Layer",
    "description": "Services focused on performance optimization",
    "components": [
      {
        "_id": "6883d9115ea05ff4c228e522",
        "name": "Redis Cache",
        "description": "Caching layer for improved performance",
        "status": "major",
        "createdAt": "2025-07-25T19:20:49.933Z",
        "updatedAt": "2025-07-25T19:21:59.371Z"
      }
    ],
    "createdAt": "2025-07-25T19:20:49.941Z",
    "updatedAt": "2025-07-25T19:20:49.941Z"
  }
]
''';

      final List<dynamic> data = jsonDecode(mockResponse);
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
      print('Error processing groups data: $error');
      // Return mock data as fallback
      return generateMockGroups();
    }
  }

  static Future<List<Incident>> fetchActiveIncidents() async {
    try {
      // Try to get API URL from environment, or use a default value
      final apiUrl = const String.fromEnvironment('API_URL', defaultValue: 'https://api.statusforsystems.com');
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
      // Return mock data as fallback
      return generateMockIncidents();
    }
  }

  // Legacy mock data generator
  static List<Service> generateMockServices() {
    final now = DateTime.now();

    return [
      Service(
        name: 'API Server',
        status: 'up',
        uptime: 99.8,
        history: _generateHistory(now, 'up', 30),
      ),
      Service(
        name: 'Web Frontend',
        status: 'up',
        uptime: 99.9,
        history: _generateHistory(now, 'up', 30),
      ),
      Service(
        name: 'Database',
        status: 'degraded',
        uptime: 98.2,
        history: _generateHistory(now, 'degraded', 30),
      ),
      Service(
        name: 'Authentication Service',
        status: 'up',
        uptime: 99.7,
        history: _generateHistory(now, 'up', 30),
      ),
      Service(
        name: 'Storage Service',
        status: 'down',
        uptime: 95.3,
        history: _generateHistory(now, 'down', 30, hasOutage: true),
      ),
    ];
  }

  // New mock data generators for the React-style components
  static List<Group> generateMockGroups() {
    final now = DateTime.now();
    final timestamp = now.toIso8601String();

    return [
      Group(
        id: '1',
        name: 'Core Services',
        description: 'Essential services for the platform',
        components: [
          Component(
            id: '101',
            name: 'API Gateway',
            description: 'Main API entry point',
            status: 'operational',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
          Component(
            id: '102',
            name: 'Authentication Service',
            description: 'User authentication and authorization',
            status: 'operational',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      ),
      Group(
        id: '2',
        name: 'Data Services',
        description: 'Database and storage services',
        components: [
          Component(
            id: '201',
            name: 'Primary Database',
            description: 'Main database cluster',
            status: 'degraded',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
          Component(
            id: '202',
            name: 'Object Storage',
            description: 'File and object storage service',
            status: 'operational',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
          Component(
            id: '203',
            name: 'Cache Service',
            description: 'Distributed caching layer',
            status: 'operational',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      ),
      Group(
        id: '3',
        name: 'Web Services',
        description: 'User-facing web applications',
        components: [
          Component(
            id: '301',
            name: 'Main Website',
            description: 'Public-facing website',
            status: 'operational',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
          Component(
            id: '302',
            name: 'Admin Portal',
            description: 'Administrative dashboard',
            status: 'major',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
          Component(
            id: '303',
            name: 'Content Delivery',
            description: 'CDN for static assets',
            status: 'partial',
            createdAt: timestamp,
            updatedAt: timestamp,
          ),
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      ),
    ];
  }

  static List<Incident> generateMockIncidents() {
    final now = DateTime.now();
    final timestamp = now.toIso8601String();
    final earlierTimestamp = now.subtract(const Duration(hours: 2)).toIso8601String();

    return [
      Incident(
        id: '1001',
        title: 'Database Performance Degradation',
        description: 'We are investigating slow query responses in our primary database cluster.',
        status: 'investigating',
        impact: 'minor',
        affectedComponents: [
          AffectedComponent(
            id: '201',
            name: 'Primary Database',
            status: 'degraded',
          ),
        ],
        createdAt: earlierTimestamp,
        updatedAt: timestamp,
      ),
      Incident(
        id: '1002',
        title: 'Admin Portal Outage',
        description: 'The admin portal is currently unavailable. Our engineers have identified the issue and are working on a fix.',
        status: 'identified',
        impact: 'major',
        affectedComponents: [
          AffectedComponent(
            id: '302',
            name: 'Admin Portal',
            status: 'major',
          ),
        ],
        createdAt: earlierTimestamp,
        updatedAt: timestamp,
      ),
      Incident(
        id: '1003',
        title: 'Content Delivery Network Issues',
        description: 'Some users may experience slow loading of static assets due to CDN routing issues.',
        status: 'monitoring',
        impact: 'minor',
        affectedComponents: [
          AffectedComponent(
            id: '303',
            name: 'Content Delivery',
            status: 'partial',
          ),
        ],
        createdAt: earlierTimestamp,
        updatedAt: timestamp,
      ),
    ];
  }

  static List<UptimeRecord> _generateHistory(
    DateTime endDate,
    String currentStatus,
    int days, {
    bool hasOutage = false,
  }) {
    final history = <UptimeRecord>[];
    final random = DateTime.now().millisecondsSinceEpoch % 10000;

    for (int i = 0; i < days; i++) {
      final date = endDate.subtract(Duration(days: i));

      // Simulate some variation in response times
      final baseResponseTime = currentStatus == 'up' ? 100.0 : 
                              currentStatus == 'degraded' ? 300.0 : 500.0;
      final variation = (random % 100) / 100 * 50; // Up to 50ms variation

      // Simulate an outage for some services
      String status = currentStatus;
      double responseTime = baseResponseTime + variation;

      if (hasOutage && i >= 5 && i <= 7) {
        status = 'down';
        responseTime = 0; // No response during outage
      }

      history.add(UptimeRecord(
        timestamp: date,
        responseTime: responseTime,
        status: status,
      ));
    }

    return history.reversed.toList(); // Most recent first
  }
}
