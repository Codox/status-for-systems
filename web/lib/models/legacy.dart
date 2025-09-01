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
