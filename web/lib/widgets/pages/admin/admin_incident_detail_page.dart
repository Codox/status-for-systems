import 'package:flutter/material.dart';
import '../../../utils/date_format.dart';
import '../../../models/incident.dart';
import '../../../models/updates.dart';
import '../../../models/component.dart';
import '../../../services/status_api_service.dart';
import '../../components/update_card.dart';
import '../../common/status_badges.dart';

class AdminIncidentDetailPage extends StatefulWidget {
  final String incidentId;

  const AdminIncidentDetailPage({
    super.key,
    required this.incidentId,
  });

  @override
  State<AdminIncidentDetailPage> createState() => _AdminIncidentDetailPageState();
}

class _AdminIncidentDetailPageState extends State<AdminIncidentDetailPage> {
  Incident? incident;
  List<Update>? updates;
  List<Component>? allComponents;
  bool isLoading = true;
  bool isSaving = false;
  String? error;

  // Status update form
  final _descriptionController = TextEditingController();
  String _selectedStatus = '';
  String _selectedImpact = '';
  Map<String, String> _componentUpdates = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    print('[DEBUG_LOG] Loading incident data for ID: ${widget.incidentId}');
    try {
      print('[DEBUG_LOG] Fetching incident details...');
      final fetchedIncident = await StatusApiService.fetchAdminIncident(widget.incidentId);
      print('[DEBUG_LOG] Incident fetched: ${fetchedIncident.title}');

      print('[DEBUG_LOG] Fetching incident updates...');
      final fetchedUpdates = await UptimeDataService.fetchAdminIncidentUpdates(widget.incidentId);
      print('[DEBUG_LOG] Updates fetched: ${fetchedUpdates.length} updates');

      print('[DEBUG_LOG] Fetching all components...');
      final fetchedComponents = await UptimeDataService.fetchAllComponents();
      print('[DEBUG_LOG] Components fetched: ${fetchedComponents.length} components');

      setState(() {
        incident = fetchedIncident;
        updates = fetchedUpdates;
        allComponents = fetchedComponents;
        _selectedStatus = fetchedIncident.status;
        _selectedImpact = fetchedIncident.impact;

        // Initialize component updates with current statuses
        _componentUpdates = {};
        for (var affectedComponent in fetchedIncident.affectedComponents) {
          _componentUpdates[affectedComponent.id] = affectedComponent.status;
        }

        isLoading = false;
      });
      print('[DEBUG_LOG] Data loading completed successfully');
    } catch (e) {
      print('[DEBUG_LOG] Error loading incident data: $e');

      // Check if it's an authentication error
      if (e.toString().contains('Authentication token')) {
        print('[DEBUG_LOG] Authentication error detected, redirecting to login');
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/admin/login');
        }
        return;
      }

      setState(() {
        error = 'Failed to load incident details: $e';
        isLoading = false;
      });
    }
  }

  Future<void> _updateIncident() async {
    if (_descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide a description for the update')),
      );
      return;
    }

    setState(() {
      isSaving = true;
      error = null;
    });

    try {
      final componentUpdatesList = _componentUpdates.entries
          .map((entry) => {'id': entry.key, 'status': entry.value})
          .toList();

      final updatedIncident = await UptimeDataService.updateIncident(
        incidentId: widget.incidentId,
        status: _selectedStatus,
        impact: _selectedImpact,
        description: _descriptionController.text.trim(),
        componentUpdates: componentUpdatesList,
      );

      // Refresh data
      final refreshedUpdates = await UptimeDataService.fetchAdminIncidentUpdates(widget.incidentId);

      setState(() {
        incident = updatedIncident;
        updates = refreshedUpdates;
        _descriptionController.clear();
        isSaving = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('Incident updated successfully! Page data refreshed.'),
            ],
          ),
          backgroundColor: Colors.green[600],
          duration: const Duration(seconds: 4),
        ),
      );
    } catch (e) {
      // Check if it's an authentication error
      if (e.toString().contains('Authentication token')) {
        print('[DEBUG_LOG] Authentication error during incident update, redirecting to login');
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/admin/login');
        }
        return;
      }

      setState(() {
        error = 'Failed to update incident. Please try again.';
        isSaving = false;
      });
    }
  }

  Future<void> _resolveIncident() async {
    setState(() {
      isSaving = true;
      error = null;
    });

    try {
      // Set all affected components to operational
      final componentUpdatesList = incident!.affectedComponents
          .map((component) => {'id': component.id, 'status': 'operational'})
          .toList();

      final updatedIncident = await UptimeDataService.updateIncident(
        incidentId: widget.incidentId,
        status: 'resolved',
        impact: 'none',
        description: 'Incident has been resolved.',
        componentUpdates: componentUpdatesList,
      );

      // Refresh data
      final refreshedUpdates = await UptimeDataService.fetchAdminIncidentUpdates(widget.incidentId);

      setState(() {
        incident = updatedIncident;
        updates = refreshedUpdates;
        _selectedStatus = 'resolved';
        _selectedImpact = 'none';
        isSaving = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('Incident resolved successfully! Page data refreshed.'),
            ],
          ),
          backgroundColor: Colors.green[600],
          duration: const Duration(seconds: 4),
        ),
      );
    } catch (e) {
      // Check if it's an authentication error
      if (e.toString().contains('Authentication token')) {
        print('[DEBUG_LOG] Authentication error during incident resolve, redirecting to login');
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/admin/login');
        }
        return;
      }

      setState(() {
        error = 'Failed to resolve incident. Please try again.';
        isSaving = false;
      });
    }
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;
    final textColor = isLightMode ? Colors.grey[600] : Colors.grey[400];
    final cardBg = isLightMode ? Colors.white : Colors.grey[800];
    final borderColor = isLightMode ? Colors.grey.shade200 : Colors.grey.shade700;
    final headerBg = isLightMode ? Colors.grey[50] : Colors.grey[700];

    if (isLoading) {
      return Scaffold(
        body: Container(
          color: isLightMode ? Colors.grey[50] : Colors.grey[900],
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (error != null && incident == null) {
      return Scaffold(
        body: Container(
          color: isLightMode ? Colors.grey[50] : Colors.grey[900],
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                color: Colors.red[50],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.error, color: Colors.red[600]),
                      const SizedBox(width: 8),
                      Expanded(child: Text(error!)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextButton.icon(
                onPressed: () => Navigator.of(context).pushReplacementNamed('/admin/incidents'),
                icon: const Icon(Icons.arrow_back, size: 16),
                label: const Text('Back'),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.grey[600],
                  textStyle: const TextStyle(fontSize: 12),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Container(
        color: isLightMode ? Colors.grey[50] : Colors.grey[900],
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1200),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Back button - made less prominent to avoid accidental navigation
                TextButton.icon(
                  onPressed: () => Navigator.of(context).pushReplacementNamed('/admin/incidents'),
                  icon: Icon(Icons.arrow_back, size: 16),
                  label: const Text('Back'),
                  style: TextButton.styleFrom(
                    foregroundColor: textColor?.withOpacity(0.7),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    textStyle: const TextStyle(fontSize: 12),
                  ),
                ),
                const SizedBox(height: 16),

                // Header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            incident!.title,
                            style: theme.textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              IncidentStatusBadge(
                                status: incident!.status,
                                showIcon: true,
                                fontSize: 12,
                              ),
                              const SizedBox(width: 8),
                              IncidentImpactBadge(
                                impact: incident!.impact,
                                showLabel: false,
                                fontSize: 12,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Created: ${DateFormatUtils.formatIsoDateTime(incident!.createdAt)} • Last updated: ${DateFormatUtils.formatIsoDateTime(incident!.updatedAt)}',
                            style: TextStyle(
                              fontSize: 14,
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (incident!.status != 'resolved') ...[
                      const SizedBox(width: 16),
                      ElevatedButton.icon(
                        onPressed: isSaving ? null : _resolveIncident,
                        icon: isSaving 
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.check),
                        label: Text(isSaving ? 'Resolving...' : 'Resolve Incident'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green[600],
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 24),

                if (error != null) ...[
                  Card(
                    color: Colors.red[50],
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(Icons.error, color: Colors.red[600]),
                          const SizedBox(width: 8),
                          Expanded(child: Text(error!)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Incident Details Card
                Card(
                  elevation: 2,
                  color: cardBg,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: headerBg,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(8),
                            topRight: Radius.circular(8),
                          ),
                        ),
                        child: Text(
                          'Incident Details',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Description',
                              style: theme.textTheme.titleSmall?.copyWith(
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
                              style: theme.textTheme.titleSmall?.copyWith(
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
                                    border: Border.all(color: borderColor!),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        component.name,
                                        style: const TextStyle(fontWeight: FontWeight.w500),
                                      ),
                                      ComponentStatusBadge(
                                        status: component.status,
                                        showIcon: true,
                                        fontSize: 12,
                                      ),
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
                  color: cardBg,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: headerBg,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(8),
                            topRight: Radius.circular(8),
                          ),
                        ),
                        child: Text(
                          'Updates',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Update Form - only show if incident is not resolved
                            if (incident!.status != 'resolved') ...[
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  border: Border.all(color: borderColor!),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Add Update',
                                      style: theme.textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 16),

                                    // Status and Impact dropdowns
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Status',
                                                style: theme.textTheme.labelMedium?.copyWith(
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              DropdownButtonFormField<String>(
                                                value: _selectedStatus,
                                                decoration: const InputDecoration(
                                                  border: OutlineInputBorder(),
                                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                ),
                                                items: const [
                                                  DropdownMenuItem(value: 'investigating', child: Text('Investigating')),
                                                  DropdownMenuItem(value: 'identified', child: Text('Identified')),
                                                  DropdownMenuItem(value: 'monitoring', child: Text('Monitoring')),
                                                  DropdownMenuItem(value: 'resolved', child: Text('Resolved')),
                                                ],
                                                onChanged: (value) {
                                                  if (value != null) {
                                                    setState(() {
                                                      _selectedStatus = value;
                                                    });
                                                  }
                                                },
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Impact',
                                                style: theme.textTheme.labelMedium?.copyWith(
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              DropdownButtonFormField<String>(
                                                value: _selectedImpact,
                                                decoration: const InputDecoration(
                                                  border: OutlineInputBorder(),
                                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                ),
                                                items: const [
                                                  DropdownMenuItem(value: 'none', child: Text('None')),
                                                  DropdownMenuItem(value: 'minor', child: Text('Minor')),
                                                  DropdownMenuItem(value: 'major', child: Text('Major')),
                                                  DropdownMenuItem(value: 'critical', child: Text('Critical')),
                                                ],
                                                onChanged: (value) {
                                                  if (value != null) {
                                                    setState(() {
                                                      _selectedImpact = value;
                                                    });
                                                  }
                                                },
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),

                                    // Description
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Description',
                                          style: theme.textTheme.labelMedium?.copyWith(
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        TextField(
                                          controller: _descriptionController,
                                          decoration: const InputDecoration(
                                            border: OutlineInputBorder(),
                                            hintText: 'Provide details about this update',
                                            contentPadding: EdgeInsets.all(12),
                                          ),
                                          maxLines: 3,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),

                                    // Component Statuses
                                    if (incident!.affectedComponents.isNotEmpty) ...[
                                      Text(
                                        'Component Statuses',
                                        style: theme.textTheme.labelMedium?.copyWith(
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      ...incident!.affectedComponents.map((affectedComponent) {
                                        final component = allComponents?.firstWhere(
                                          (c) => c.id == affectedComponent.id,
                                          orElse: () => Component(
                                            id: affectedComponent.id,
                                            name: affectedComponent.name,
                                            description: '',
                                            status: affectedComponent.status,
                                            createdAt: '',
                                            updatedAt: '',
                                          ),
                                        );

                                        if (component == null) return const SizedBox.shrink();

                                        return Container(
                                          margin: const EdgeInsets.only(bottom: 8),
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            border: Border.all(color: borderColor),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                component.name,
                                                style: const TextStyle(fontWeight: FontWeight.w500),
                                              ),
                                              const SizedBox(height: 8),
                                              DropdownButtonFormField<String>(
                                                value: _componentUpdates[affectedComponent.id] ?? affectedComponent.status,
                                                decoration: const InputDecoration(
                                                  border: OutlineInputBorder(),
                                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                ),
                                                items: const [
                                                  DropdownMenuItem(value: 'operational', child: Text('Operational')),
                                                  DropdownMenuItem(value: 'degraded', child: Text('Degraded')),
                                                  DropdownMenuItem(value: 'partial', child: Text('Partial Outage')),
                                                  DropdownMenuItem(value: 'major', child: Text('Major Outage')),
                                                  DropdownMenuItem(value: 'under_maintenance', child: Text('Under Maintenance')),
                                                ],
                                                onChanged: (value) {
                                                  if (value != null) {
                                                    setState(() {
                                                      _componentUpdates[affectedComponent.id] = value;
                                                    });
                                                  }
                                                },
                                              ),
                                            ],
                                          ),
                                        );
                                      }),
                                      const SizedBox(height: 16),
                                    ],

                                    // Save button
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: ElevatedButton(
                                        onPressed: isSaving ? null : _updateIncident,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.blue[600],
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                        ),
                                        child: isSaving
                                            ? const Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  SizedBox(
                                                    width: 16,
                                                    height: 16,
                                                    child: CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      color: Colors.white,
                                                    ),
                                                  ),
                                                  SizedBox(width: 8),
                                                  Text('Updating...'),
                                                ],
                                              )
                                            : const Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(Icons.save, size: 16),
                                                  SizedBox(width: 6),
                                                  Text('Add Update'),
                                                ],
                                              ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Divider(),
                            ],

                            const SizedBox(height: 16),

                            // Updates List
                            if (updates == null || updates!.isEmpty)
                              Text(
                                'No updates yet',
                                style: TextStyle(color: textColor),
                              )
                            else
                              ...updates!.map((update) => UnifiedCard(
                                update: update,
                                style: UnifiedCardStyle.admin,
                                borderColor: borderColor,
                                allComponents: allComponents,
                              )),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
