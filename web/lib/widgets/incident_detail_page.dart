import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';

class IncidentDetailPage extends StatefulWidget {
  final String incidentId;

  const IncidentDetailPage({
    super.key,
    required this.incidentId,
  });

  @override
  State<IncidentDetailPage> createState() => _IncidentDetailPageState();
}

class _IncidentDetailPageState extends State<IncidentDetailPage> {
  Incident? incident;
  List<Update>? updates;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final fetchedIncident = await UptimeDataService.fetchIncident(widget.incidentId);
      final fetchedUpdates = await UptimeDataService.fetchIncidentUpdates(widget.incidentId);

      setState(() {
        incident = fetchedIncident;
        updates = fetchedUpdates;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Failed to load incident details. Please try again.';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[50]
        : Colors.grey[900];
    final textColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[600]
        : Colors.grey[400];

    // Get responsive horizontal padding based on screen width
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = _getResponsiveHorizontalPadding(screenWidth);

    if (isLoading) {
      return Scaffold(
        backgroundColor: bgColor,
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (error != null || incident == null) {
      return Scaffold(
        backgroundColor: bgColor,
        body: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16.0),
            child: Column(
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Icon(Icons.error, color: Colors.red),
                        const SizedBox(width: 8),
                        Text(error ?? 'Incident not found or failed to load'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Back to Dashboard'),
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button
              ElevatedButton.icon(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.arrow_back),
                label: const Text('Back to Dashboard'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  foregroundColor: textColor,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Header
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    incident!.title,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildStatusBadge(incident!.status),
                      const SizedBox(width: 8),
                      _buildImpactBadge(incident!.impact),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Created: ${_formatDate(incident!.createdAt)} • Last updated: ${_formatDate(incident!.updatedAt)}',
                    style: TextStyle(
                      fontSize: 14,
                      color: textColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Incident Details Card
              Card(
                elevation: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.light
                            ? Colors.grey[100]
                            : Colors.grey[800],
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(8),
                          topRight: Radius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Incident Details',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Description',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(incident!.description),
                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 16),
                          Text(
                            'Affected Components',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          if (incident!.affectedComponents.isEmpty)
                            Text(
                              'No components affected',
                              style: TextStyle(color: textColor),
                            )
                          else
                            ...incident!.affectedComponents.map((component) => 
                              Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      component.name,
                                      style: const TextStyle(fontWeight: FontWeight.w500),
                                    ),
                                    _buildComponentStatusBadge(component.status),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Updates Card
              Card(
                elevation: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.light
                            ? Colors.grey[100]
                            : Colors.grey[800],
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(8),
                          topRight: Radius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Updates',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: updates == null || updates!.isEmpty
                          ? Text(
                              'No updates yet',
                              style: TextStyle(color: textColor),
                            )
                          : Column(
                              children: updates!.map((update) => _buildUpdateCard(update)).toList(),
                            ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
        'Impact: ${_capitalizeFirstLetter(impact)}',
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
      default:
        color = Colors.purple;
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

  Widget _buildUpdateCard(Update update) {
    final borderColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey.shade300
        : Colors.grey.shade700;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: borderColor),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _formatUpdateType(update.type),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                _formatDate(update.createdAt),
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).brightness == Brightness.light
                      ? Colors.grey[600]
                      : Colors.grey[400],
                ),
              ),
            ],
          ),
          if (update.description != null) ...[
            const SizedBox(height: 8),
            Text(
              'Description:',
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
            ),
            const SizedBox(height: 4),
            Text(update.description!),
          ],
          if (update.statusUpdate != null) ...[
            const SizedBox(height: 8),
            Text(
              'Status Change:',
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildStatusBadge(update.statusUpdate!.from ?? 'unknown'),
                const SizedBox(width: 8),
                const Text('→'),
                const SizedBox(width: 8),
                _buildStatusBadge(update.statusUpdate!.to),
              ],
            ),
          ],
          if (update.componentStatusUpdates != null && update.componentStatusUpdates!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Component Updates:',
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
            ),
            const SizedBox(height: 4),
            ...update.componentStatusUpdates!.map((compUpdate) {
              final component = incident!.affectedComponents.firstWhere(
                (c) => c.id == compUpdate.id,
                orElse: () => AffectedComponent(id: compUpdate.id, name: 'Unknown Component', status: 'unknown'),
              );
              return Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Text('${component.name}: ', style: const TextStyle(fontSize: 12)),
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
            .map((word) => word.isNotEmpty ? word[0].toUpperCase() + word.substring(1) : '')
            .join(' ');
    }
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return DateFormat('MMM dd, yyyy HH:mm').format(date);
  }

  String _capitalizeFirstLetter(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1);
  }

  /// Get responsive horizontal padding based on screen width
  double _getResponsiveHorizontalPadding(double screenWidth) {
    if (screenWidth < 600) {
      // Mobile: 16px padding
      return 16.0;
    } else if (screenWidth < 900) {
      // Small tablet: 24px padding
      return 24.0;
    } else if (screenWidth < 1200) {
      // Large tablet: 40px padding
      return 40.0;
    } else if (screenWidth < 1600) {
      // Desktop: 80px padding
      return 80.0;
    } else {
      // Large desktop: 120px padding
      return 120.0;
    }
  }
}