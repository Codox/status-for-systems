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
