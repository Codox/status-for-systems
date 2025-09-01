import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../utils/date_format.dart';
import '../../models/updates.dart';
import '../../models/incident.dart';
import '../../models/component.dart';
import '../common/status_badges.dart';

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
                            IncidentStatusBadge(
                              status: incident!.status,
                              showIcon: true,
                              fontSize: 12,
                            ),
                            IncidentImpactBadge(
                              impact: incident!.impact,
                              showLabel: false,
                              fontSize: 12,
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
                            IncidentStatusBadge(
                              status: incident!.status,
                              showIcon: true,
                              fontSize: 12,
                            ),
                            IncidentImpactBadge(
                              impact: incident!.impact,
                              showLabel: false,
                              fontSize: 12,
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
                  'Updated: ${DateFormatUtils.formatIsoDateTime(incident!.updatedAt)}',
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
          color: StatusUtils.getIncidentImpactColor(incident!.impact),
        ),
        title: Text(incident!.title),
        subtitle: Text(incident!.description),
        trailing: IncidentStatusBadge(
          status: incident!.status,
          showIcon: true,
          fontSize: 12,
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
                DateFormatUtils.formatIsoDateTime(update!.createdAt),
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
                IncidentStatusBadge(
                  status: update!.statusUpdate!.from ?? 'unknown',
                  showIcon: true,
                  fontSize: 12,
                ),
                const SizedBox(width: 8),
                const Text('→'),
                const SizedBox(width: 8),
                IncidentStatusBadge(
                  status: update!.statusUpdate!.to,
                  showIcon: true,
                  fontSize: 12,
                ),
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
                IncidentImpactBadge(
                  impact: update!.impactUpdate!.from,
                  showLabel: false,
                  fontSize: 12,
                ),
                const SizedBox(width: 8),
                const Text('→'),
                const SizedBox(width: 8),
                IncidentImpactBadge(
                  impact: update!.impactUpdate!.to,
                  showLabel: false,
                  fontSize: 12,
                ),
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
                    ComponentStatusBadge(
                      status: compUpdate.from,
                      showIcon: true,
                      fontSize: 12,
                    ),
                    const SizedBox(width: 8),
                    const Text('→', style: TextStyle(fontSize: 12)),
                    const SizedBox(width: 8),
                    ComponentStatusBadge(
                      status: compUpdate.to,
                      showIcon: true,
                      fontSize: 12,
                    ),
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

  String _capitalizeFirstLetter(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }
}