import 'package:flutter/material.dart';

/// Standardized status badge components for consistent display across the application
/// Supports Component Status, Incident Status, and Incident Impact

class ComponentStatusBadge extends StatelessWidget {
  final String status;
  final bool showIcon;
  final double fontSize;
  final EdgeInsets padding;

  const ComponentStatusBadge({
    super.key,
    required this.status,
    this.showIcon = true,
    this.fontSize = 12,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  });

  @override
  Widget build(BuildContext context) {
    final config = _getComponentStatusConfig(status);
    
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: config.color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(
              config.icon,
              size: fontSize + 2,
              color: config.color,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            config.displayText,
            style: TextStyle(
              color: config.color,
              fontSize: fontSize,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  _ComponentStatusConfig _getComponentStatusConfig(String status) {
    switch (status.toLowerCase()) {
      case 'operational':
        return _ComponentStatusConfig(
          color: Colors.green.shade600,
          icon: Icons.check_circle,
          displayText: 'Operational',
        );
      case 'degraded':
        return _ComponentStatusConfig(
          color: Colors.amber.shade700,
          icon: Icons.warning,
          displayText: 'Degraded',
        );
      case 'partial':
        return _ComponentStatusConfig(
          color: Colors.orange.shade600,
          icon: Icons.error,
          displayText: 'Partial Outage',
        );
      case 'major':
        return _ComponentStatusConfig(
          color: Colors.red.shade600,
          icon: Icons.cancel,
          displayText: 'Major Outage',
        );
      case 'under_maintenance':
        return _ComponentStatusConfig(
          color: Colors.blue.shade600,
          icon: Icons.build,
          displayText: 'Under Maintenance',
        );
      default:
        return _ComponentStatusConfig(
          color: Colors.grey.shade600,
          icon: Icons.help,
          displayText: 'Unknown',
        );
    }
  }
}

class IncidentStatusBadge extends StatelessWidget {
  final String status;
  final bool showIcon;
  final double fontSize;
  final EdgeInsets padding;

  const IncidentStatusBadge({
    super.key,
    required this.status,
    this.showIcon = true,
    this.fontSize = 12,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  });

  @override
  Widget build(BuildContext context) {
    final config = _getIncidentStatusConfig(status);
    
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: config.color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(
              config.icon,
              size: fontSize + 2,
              color: config.color,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            config.displayText,
            style: TextStyle(
              color: config.color,
              fontSize: fontSize,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  _IncidentStatusConfig _getIncidentStatusConfig(String status) {
    switch (status.toLowerCase()) {
      case 'investigating':
        return _IncidentStatusConfig(
          color: Colors.orange.shade600,
          icon: Icons.search,
          displayText: 'Investigating',
        );
      case 'identified':
        return _IncidentStatusConfig(
          color: Colors.blue.shade600,
          icon: Icons.info_outline,
          displayText: 'Identified',
        );
      case 'monitoring':
        return _IncidentStatusConfig(
          color: Colors.purple.shade600,
          icon: Icons.visibility,
          displayText: 'Monitoring',
        );
      case 'resolved':
        return _IncidentStatusConfig(
          color: Colors.green.shade600,
          icon: Icons.check_circle_outline,
          displayText: 'Resolved',
        );
      default:
        return _IncidentStatusConfig(
          color: Colors.grey.shade600,
          icon: Icons.info_outline,
          displayText: 'Unknown',
        );
    }
  }
}

class IncidentImpactBadge extends StatelessWidget {
  final String impact;
  final double fontSize;
  final EdgeInsets padding;
  final bool showLabel;

  const IncidentImpactBadge({
    super.key,
    required this.impact,
    this.fontSize = 12,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    this.showLabel = true,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getIncidentImpactConfig(impact);
    
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: config.color.withOpacity(0.3)),
      ),
      child: Text(
        showLabel ? 'Impact: ${config.displayText}' : config.displayText,
        style: TextStyle(
          color: config.color,
          fontSize: fontSize,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  _IncidentImpactConfig _getIncidentImpactConfig(String impact) {
    switch (impact.toLowerCase()) {
      case 'critical':
        return _IncidentImpactConfig(
          color: Colors.red.shade600,
          displayText: 'Critical',
        );
      case 'major':
        return _IncidentImpactConfig(
          color: Colors.orange.shade600,
          displayText: 'Major',
        );
      case 'minor':
        return _IncidentImpactConfig(
          color: Colors.amber.shade700,
          displayText: 'Minor',
        );
      case 'none':
        return _IncidentImpactConfig(
          color: Colors.grey.shade600,
          displayText: 'None',
        );
      default:
        return _IncidentImpactConfig(
          color: Colors.grey.shade600,
          displayText: 'Unknown',
        );
    }
  }
}

// Configuration classes for status information
class _ComponentStatusConfig {
  final Color color;
  final IconData icon;
  final String displayText;

  _ComponentStatusConfig({
    required this.color,
    required this.icon,
    required this.displayText,
  });
}

class _IncidentStatusConfig {
  final Color color;
  final IconData icon;
  final String displayText;

  _IncidentStatusConfig({
    required this.color,
    required this.icon,
    required this.displayText,
  });
}

class _IncidentImpactConfig {
  final Color color;
  final String displayText;

  _IncidentImpactConfig({
    required this.color,
    required this.displayText,
  });
}

// Utility functions for getting status colors and icons (for backward compatibility)
class StatusUtils {
  static String getComponentStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'partial':
        return 'Partial Outage';
      case 'major':
        return 'Major Outage';
      case 'under_maintenance':
        return 'Under Maintenance';
      default:
        return 'Unknown';
    }
  }

  static Color getComponentStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'operational':
        return Colors.green.shade600;
      case 'degraded':
        return Colors.amber.shade700;
      case 'partial':
        return Colors.orange.shade600;
      case 'major':
        return Colors.red.shade600;
      case 'under_maintenance':
        return Colors.blue.shade600;
      default:
        return Colors.grey.shade600;
    }
  }

  static IconData getComponentStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'operational':
        return Icons.check_circle;
      case 'degraded':
        return Icons.warning;
      case 'partial':
        return Icons.error;
      case 'major':
        return Icons.cancel;
      case 'under_maintenance':
        return Icons.build;
      default:
        return Icons.help;
    }
  }

  static Color getIncidentStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'investigating':
        return Colors.orange.shade600;
      case 'identified':
        return Colors.blue.shade600;
      case 'monitoring':
        return Colors.purple.shade600;
      case 'resolved':
        return Colors.green.shade600;
      default:
        return Colors.grey.shade600;
    }
  }

  static IconData getIncidentStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'investigating':
        return Icons.search;
      case 'identified':
        return Icons.info_outline;
      case 'monitoring':
        return Icons.visibility;
      case 'resolved':
        return Icons.check_circle_outline;
      default:
        return Icons.info_outline;
    }
  }

  static Color getIncidentImpactColor(String impact) {
    switch (impact.toLowerCase()) {
      case 'critical':
        return Colors.red.shade600;
      case 'major':
        return Colors.orange.shade600;
      case 'minor':
        return Colors.amber.shade700;
      case 'none':
        return Colors.grey.shade600;
      default:
        return Colors.grey.shade600;
    }
  }
}