import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/uptime_data.dart';
import '../../common/status_badges.dart';
import '../../components/update_card.dart';
import '../../common/public_back_button.dart';

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
                        const Icon(Icons.error, color: Colors.red),
                        const SizedBox(width: 8),
                        Text(error ?? 'Incident not found or failed to load'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Builder(
                  builder: (context) {
                    final args = ModalRoute.of(context)?.settings.arguments;
                    final fromHistory = args is Map && args['from'] == 'history';
                    return PublicBackButton(
                      label: fromHistory ? 'Back to History' : 'Back to Dashboard',
                      onPressed: fromHistory
                          ? () => Navigator.of(context).pop()
                          : null,
                    );
                  },
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
              Builder(
                builder: (context) {
                  final args = ModalRoute.of(context)?.settings.arguments;
                  final fromHistory = args is Map && args['from'] == 'history';
                  return PublicBackButton(
                    label: fromHistory ? 'Back to History' : 'Back to Dashboard',
                    onPressed: fromHistory
                        ? () => Navigator.of(context).pop()
                        : null, // default goes to dashboard
                  );
                },
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
                              children: updates!.map((update) => UnifiedCard(
                                update: update,
                                style: UnifiedCardStyle.standard,
                                affectedComponents: incident?.affectedComponents,
                              )).toList(),
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
    return IncidentStatusBadge(
      status: status,
      showIcon: true,
      fontSize: 12,
    );
  }

  Widget _buildImpactBadge(String impact) {
    return IncidentImpactBadge(
      impact: impact,
      showLabel: true,
      fontSize: 12,
    );
  }

  Widget _buildComponentStatusBadge(String status) {
    return ComponentStatusBadge(
      status: status,
      showIcon: true,
      fontSize: 12,
    );
  }


  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return DateFormat('MMM dd, yyyy HH:mm').format(date);
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