import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/uptime_data.dart';

enum IncidentCardStyle {
  card,     // Full card layout (for public dashboard)
  listTile, // List tile layout (for admin dashboard)
}

class IncidentUpdateCard extends StatelessWidget {
  final Incident incident;
  final IncidentCardStyle style;
  final VoidCallback? onTap;
  final bool showUpdatedTime;

  const IncidentUpdateCard({
    super.key,
    required this.incident,
    this.style = IncidentCardStyle.card,
    this.onTap,
    this.showUpdatedTime = true,
  });

  @override
  Widget build(BuildContext context) {
    switch (style) {
      case IncidentCardStyle.card:
        return _buildCardStyle(context);
      case IncidentCardStyle.listTile:
        return _buildListTileStyle(context);
    }
  }

  Widget _buildCardStyle(BuildContext context) {
    // Get status color and icon
    final statusColor = _getStatusColor(incident.status);
    final statusIcon = _getStatusIcon(incident.status);

    // Get impact color
    final impactColor = _getImpactColor(incident.impact);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Use Column layout on small screens to prevent overflow
              LayoutBuilder(
                builder: (context, constraints) {
                  final isSmallScreen = constraints.maxWidth < 480;

                  if (isSmallScreen) {
                    // Stack title and badges vertically on small screens
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          incident.title,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          runSpacing: 4,
                          children: [
                            _buildBadge(
                              context,
                              '$statusIcon ${_capitalizeFirstLetter(incident.status)}',
                              statusColor,
                            ),
                            _buildBadge(
                              context,
                              _capitalizeFirstLetter(incident.impact),
                              impactColor,
                            ),
                          ],
                        ),
                      ],
                    );
                  } else {
                    // Use horizontal layout on larger screens
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            incident.title,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        Wrap(
                          spacing: 4,
                          children: [
                            _buildBadge(
                              context,
                              '$statusIcon ${_capitalizeFirstLetter(incident.status)}',
                              statusColor,
                            ),
                            _buildBadge(
                              context,
                              _capitalizeFirstLetter(incident.impact),
                              impactColor,
                            ),
                          ],
                        ),
                      ],
                    );
                  }
                },
              ),
              const SizedBox(height: 8),
              Text(
                incident.description,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).brightness == Brightness.light
                      ? Colors.grey[600]
                      : Colors.grey[400],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (showUpdatedTime) ...[
                const SizedBox(height: 8),
                Text(
                  'Updated: ${_formatDateTime(incident.updatedAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).brightness == Brightness.light
                        ? Colors.grey[600]
                        : Colors.grey[400],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildListTileStyle(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          Icons.warning,
          color: _getImpactColor(incident.impact),
        ),
        title: Text(incident.title),
        subtitle: Text(incident.description),
        trailing: Chip(
          label: Text(
            incident.status.toUpperCase(),
            style: const TextStyle(fontSize: 12),
          ),
          backgroundColor: _getImpactColor(incident.impact).withOpacity(0.1),
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildBadge(BuildContext context, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  String _capitalizeFirstLetter(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  String _formatDateTime(String dateTimeStr) {
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      return DateFormat('MMM dd, yyyy HH:mm').format(dateTime);
    } catch (e) {
      return dateTimeStr;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'investigating':
        return Colors.orange;
      case 'identified':
        return Colors.red;
      case 'monitoring':
        return Colors.blue;
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'investigating':
        return '🔍';
      case 'identified':
        return '⚠️';
      case 'monitoring':
        return '👁️';
      case 'resolved':
        return '✅';
      default:
        return '❓';
    }
  }

  Color _getImpactColor(String impact) {
    switch (impact.toLowerCase()) {
      case 'critical':
        return Colors.red;
      case 'major':
        return Colors.orange;
      case 'minor':
        return Colors.yellow[700]!;
      default:
        return Colors.grey;
    }
  }
}