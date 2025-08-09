import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/uptime_data.dart';

enum UnifiedCardStyle {
  standard,     // Standard card layout for updates
  admin,        // Admin-specific styling with border color for updates
  incidentCard, // Full card layout for incidents (public dashboard)
  incidentList, // List tile layout for incidents (admin dashboard)
}

class UnifiedCard extends StatelessWidget {
  final Update? update;
  final Incident? incident;
  final UnifiedCardStyle style;
  final Color? borderColor;
  final List<Component>? allComponents;
  final List<AffectedComponent>? affectedComponents;
  final VoidCallback? onTap;
  final bool showUpdatedTime;

  const UnifiedCard({
    super.key,
    this.update,
    this.incident,
    this.style = UnifiedCardStyle.standard,
    this.borderColor,
    this.allComponents,
    this.affectedComponents,
    this.onTap,
    this.showUpdatedTime = true,
  }) : assert(update != null || incident != null, 'Either update or incident must be provided');

  @override
  Widget build(BuildContext context) {
    if (incident != null) {
      return _buildIncidentCard(context);
    } else if (update != null) {
      return _buildUpdateCard(context);
    } else {
      throw Exception('Either update or incident must be provided');
    }
  }

  Widget _buildIncidentCard(BuildContext context) {
    switch (style) {
      case UnifiedCardStyle.incidentCard:
        return _buildIncidentCardStyle(context);
      case UnifiedCardStyle.incidentList:
        return _buildIncidentListTileStyle(context);
      default:
        return _buildIncidentCardStyle(context);
    }
  }

  Widget _buildIncidentCardStyle(BuildContext context) {
    // Get status color and icon
    final statusColor = _getStatusColor(incident!.status);
    final statusIcon = _getStatusIcon(incident!.status);

    // Get impact color
    final impactColor = _getImpactColor(incident!.impact);

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
                          incident!.title,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          runSpacing: 4,
                          children: [
                            _buildIncidentBadge(
                              context,
                              '$statusIcon ${_capitalizeFirstLetter(incident!.status)}',
                              statusColor,
                            ),
                            _buildIncidentBadge(
                              context,
                              _capitalizeFirstLetter(incident!.impact),
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
                            incident!.title,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        Wrap(
                          spacing: 4,
                          children: [
                            _buildIncidentBadge(
                              context,
                              '$statusIcon ${_capitalizeFirstLetter(incident!.status)}',
                              statusColor,
                            ),
                            _buildIncidentBadge(
                              context,
                              _capitalizeFirstLetter(incident!.impact),
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
                incident!.description,
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
                  'Updated: ${_formatDateTime(incident!.updatedAt)}',
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

  Widget _buildIncidentListTileStyle(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          Icons.warning,
          color: _getImpactColor(incident!.impact),
        ),
        title: Text(incident!.title),
        subtitle: Text(incident!.description),
        trailing: Chip(
          label: Text(
            incident!.status.toUpperCase(),
            style: const TextStyle(fontSize: 12),
          ),
          backgroundColor: _getImpactColor(incident!.impact).withOpacity(0.1),
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildUpdateCard(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.brightness == Brightness.light ? Colors.grey[600] : Colors.grey[400];
    final defaultBorderColor = theme.brightness == Brightness.light
        ? Colors.grey.shade300
        : Colors.grey.shade700;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: borderColor ?? defaultBorderColor),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _formatUpdateType(update!.type),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                _formatDate(update!.createdAt),
                style: TextStyle(
                  fontSize: 12,
                  color: textColor,
                ),
              ),
            ],
          ),
          if (update!.description != null) ...[
            const SizedBox(height: 8),
            Text(
              'Description:',
              style: TextStyle(
                fontWeight: style == UnifiedCardStyle.admin ? FontWeight.bold : FontWeight.w500,
                fontSize: style == UnifiedCardStyle.admin ? 14 : 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(update!.description!),
          ],
          if (update!.statusUpdate != null) ...[
            const SizedBox(height: 8),
            Text(
              'Status Change:',
              style: TextStyle(
                fontWeight: style == UnifiedCardStyle.admin ? FontWeight.bold : FontWeight.w500,
                fontSize: style == UnifiedCardStyle.admin ? 14 : 12,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildStatusBadge(update!.statusUpdate!.from ?? 'unknown'),
                const SizedBox(width: 8),
                const Text('→'),
                const SizedBox(width: 8),
                _buildStatusBadge(update!.statusUpdate!.to),
              ],
            ),
          ],
          if (update!.impactUpdate != null) ...[
            const SizedBox(height: 8),
            Text(
              'Impact Change:',
              style: TextStyle(
                fontWeight: style == UnifiedCardStyle.admin ? FontWeight.bold : FontWeight.w500,
                fontSize: style == UnifiedCardStyle.admin ? 14 : 12,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildImpactBadge(update!.impactUpdate!.from),
                const SizedBox(width: 8),
                const Text('→'),
                const SizedBox(width: 8),
                _buildImpactBadge(update!.impactUpdate!.to),
              ],
            ),
          ],
          if (update!.componentStatusUpdates != null && update!.componentStatusUpdates!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Component Updates:',
              style: TextStyle(
                fontWeight: style == UnifiedCardStyle.admin ? FontWeight.bold : FontWeight.w500,
                fontSize: style == UnifiedCardStyle.admin ? 14 : 12,
              ),
            ),
            const SizedBox(height: 4),
            ...update!.componentStatusUpdates!.map((compUpdate) {
              final component = _findComponent(compUpdate.id);
              return Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Text('${component?.name ?? 'Unknown'}: ', style: const TextStyle(fontSize: 12)),
                    _buildComponentStatusBadge(compUpdate.from),
                    const SizedBox(width: 8),
                    const Text('→', style: TextStyle(fontSize: 12)),
                    const SizedBox(width: 8),
                    _buildComponentStatusBadge(compUpdate.to),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  dynamic _findComponent(String id) {
    // Try to find in allComponents first (admin context)
    if (allComponents != null) {
      try {
        return allComponents!.firstWhere(
          (c) => c.id == id,
          orElse: () => Component(
            id: id,
            name: 'Unknown Component',
            description: '',
            status: 'unknown',
            createdAt: '',
            updatedAt: '',
          ),
        );
      } catch (e) {
        return Component(
          id: id,
          name: 'Unknown Component',
          description: '',
          status: 'unknown',
          createdAt: '',
          updatedAt: '',
        );
      }
    }
    
    // Try to find in affectedComponents (public context)
    if (affectedComponents != null) {
      try {
        return affectedComponents!.firstWhere(
          (c) => c.id == id,
          orElse: () => AffectedComponent(id: id, name: 'Unknown Component', status: 'unknown'),
        );
      } catch (e) {
        return AffectedComponent(id: id, name: 'Unknown Component', status: 'unknown');
      }
    }
    
    return null;
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    IconData icon;

    switch (status) {
      case 'investigating':
        color = Colors.orange;
        icon = Icons.search;
        break;
      case 'identified':
        color = Colors.blue;
        icon = Icons.info;
        break;
      case 'monitoring':
        color = Colors.purple;
        icon = Icons.visibility;
        break;
      case 'resolved':
        color = Colors.green;
        icon = Icons.check;
        break;
      default:
        color = Colors.grey;
        icon = Icons.info;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            _capitalizeFirstLetter(status),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentBadge(BuildContext context, String text, Color color) {
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

  Widget _buildImpactBadge(String impact) {
    Color color;

    switch (impact) {
      case 'critical':
        color = Colors.red;
        break;
      case 'major':
        color = Colors.orange;
        break;
      case 'minor':
        color = Colors.yellow.shade700;
        break;
      case 'none':
        color = Colors.green;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        style == UnifiedCardStyle.standard ? 'Impact: ${_capitalizeFirstLetter(impact)}' : _capitalizeFirstLetter(impact),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildComponentStatusBadge(String status) {
    Color color;

    switch (status) {
      case 'operational':
        color = Colors.green;
        break;
      case 'degraded':
        color = Colors.yellow.shade700;
        break;
      case 'partial':
        color = Colors.orange;
        break;
      case 'major':
        color = Colors.red;
        break;
      case 'under_maintenance':
        color = Colors.blue;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        _capitalizeFirstLetter(status.replaceAll('_', ' ')),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatUpdateType(String type) {
    switch (type) {
      case 'created':
        return 'Incident Created';
      case 'updated':
        return 'Incident Updated';
      case 'status_changed':
        return 'Status Changed';
      case 'impact_changed':
        return 'Impact Changed';
      case 'component_updated':
        return 'Component Updated';
      default:
        return type.replaceAll('_', ' ').split(' ')
            .map((word) => _capitalizeFirstLetter(word))
            .join(' ');
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

  String _formatDateTime(String dateTimeStr) {
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      return DateFormat('MMM dd, yyyy HH:mm').format(dateTime);
    } catch (e) {
      return dateTimeStr;
    }
  }

  String _formatDate(String dateTimeStr) {
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      return DateFormat('MMM dd, yyyy HH:mm').format(dateTime);
    } catch (e) {
      return dateTimeStr;
    }
  }

  String _capitalizeFirstLetter(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }
}