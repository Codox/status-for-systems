import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';

class AdminIncidentDetail extends StatefulWidget {
  final String incidentId;

  const AdminIncidentDetail({
    super.key,
    required this.incidentId,
  });

  @override
  State<AdminIncidentDetail> createState() => _AdminIncidentDetailState();
}

class _AdminIncidentDetailState extends State<AdminIncidentDetail> {
  Incident? incident;
  List<Update>? updates;
  List<Component>? allComponents;
  bool isLoading = true;
  bool isSaving = false;
  bool isClosing = false;
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
      final fetchedIncident = await UptimeDataService.fetchAdminIncident(widget.incidentId);
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
          content: Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              const Text('Incident updated successfully! Page data refreshed.'),
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

  Future<void> _closeIncident() async {
    setState(() {
      isClosing = true;
      error = null;
    });

    try {
      await UptimeDataService.closeIncident(widget.incidentId);

      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/admin/incidents');
      }
    } catch (e) {
      // Check if it's an authentication error
      if (e.toString().contains('Authentication token')) {
        print('[DEBUG_LOG] Authentication error during incident close, redirecting to login');
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/admin/login');
        }
        return;
      }

      setState(() {
        error = 'Failed to close incident. Please try again.';
        isClosing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;
    final textColor = isLightMode ? Colors.grey[600] : Colors.grey[400];
    final cardBg = isLightMode ? Colors.white : Colors.grey[800];
    final borderColor = isLightMode ? Colors.grey[200] : Colors.grey[700];
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
                label: const Text('← Back'),
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
                  label: const Text('← Back'),
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
                    ),
                    if (incident!.status != 'resolved') ...[
                      const SizedBox(width: 16),
                      ElevatedButton.icon(
                        onPressed: isClosing ? null : _closeIncident,
                        icon: isClosing 
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.check),
                        label: Text(isClosing ? 'Closing...' : 'Close Incident'),
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
                                    borderRadius: BorderRadius.circular(8),
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
                            // Update Form
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(color: borderColor!),
                                borderRadius: BorderRadius.circular(8),
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
                                          borderRadius: BorderRadius.circular(8),
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
                            const SizedBox(height: 16),

                            // Updates List
                            if (updates == null || updates!.isEmpty)
                              Text(
                                'No updates yet',
                                style: TextStyle(color: textColor),
                              )
                            else
                              ...updates!.map((update) => _buildUpdateCard(update, borderColor)),
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
        borderRadius: BorderRadius.circular(12),
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
        borderRadius: BorderRadius.circular(12),
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
        borderRadius: BorderRadius.circular(12),
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

  Widget _buildUpdateCard(Update update, Color borderColor) {
    final theme = Theme.of(context);
    final textColor = theme.brightness == Brightness.light ? Colors.grey[600] : Colors.grey[400];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: borderColor),
        borderRadius: BorderRadius.circular(8),
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
                  color: textColor,
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
              final component = allComponents?.firstWhere(
                (c) => c.id == compUpdate.id,
                orElse: () => Component(
                  id: compUpdate.id,
                  name: 'Unknown Component',
                  description: '',
                  status: 'unknown',
                  createdAt: '',
                  updatedAt: '',
                ),
              );
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
}
