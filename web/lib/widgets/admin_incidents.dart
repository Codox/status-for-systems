import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';

class AdminIncidents extends StatefulWidget {
  const AdminIncidents({super.key});

  @override
  State<AdminIncidents> createState() => _AdminIncidentsState();
}

class _AdminIncidentsState extends State<AdminIncidents> {
  List<Incident>? incidents;
  bool isLoading = true;
  String? error;
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadIncidents();
  }

  Future<void> _loadIncidents() async {
    try {
      final fetchedIncidents = await UptimeDataService.fetchActiveIncidents();
      setState(() {
        incidents = fetchedIncidents;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  List<Incident> get filteredIncidents {
    if (incidents == null) return [];
    
    switch (_selectedFilter) {
      case 'active':
        return incidents!.where((i) => i.status != 'resolved').toList();
      case 'resolved':
        return incidents!.where((i) => i.status == 'resolved').toList();
      case 'critical':
        return incidents!.where((i) => i.impact == 'critical').toList();
      case 'major':
        return incidents!.where((i) => i.impact == 'major').toList();
      default:
        return incidents!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading incidents',
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              error!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.red[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  isLoading = true;
                  error = null;
                });
                _loadIncidents();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Incidents Management',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Monitor and manage system incidents',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.brightness == Brightness.light 
                        ? Colors.grey[600] 
                        : Colors.grey[400],
                  ),
                ),
              ],
            ),
            ElevatedButton.icon(
              onPressed: () {
                // TODO: Implement create incident functionality
                _showCreateIncidentDialog();
              },
              icon: const Icon(Icons.add),
              label: const Text('New Incident'),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Filters
        _buildFilters(),
        const SizedBox(height: 16),

        // Incidents List
        Expanded(
          child: _buildIncidentsList(),
        ),
      ],
    );
  }

  Widget _buildFilters() {
    final filters = [
      {'key': 'all', 'label': 'All Incidents'},
      {'key': 'active', 'label': 'Active'},
      {'key': 'resolved', 'label': 'Resolved'},
      {'key': 'critical', 'label': 'Critical'},
      {'key': 'major', 'label': 'Major'},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((filter) {
          final isSelected = _selectedFilter == filter['key'];
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: FilterChip(
              label: Text(filter['label']!),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  _selectedFilter = filter['key']!;
                });
              },
              backgroundColor: Colors.transparent,
              selectedColor: Theme.of(context).primaryColor.withOpacity(0.1),
              checkmarkColor: Theme.of(context).primaryColor,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildIncidentsList() {
    final filtered = filteredIncidents;

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 64,
              color: Colors.green[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No incidents found',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              _selectedFilter == 'all' 
                  ? 'All systems are operational'
                  : 'No incidents match the selected filter',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final incident = filtered[index];
        return _buildIncidentCard(incident);
      },
    );
  }

  Widget _buildIncidentCard(Incident incident) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              children: [
                Icon(
                  _getIncidentIcon(incident.impact),
                  color: _getIncidentColor(incident.impact),
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    incident.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Chip(
                  label: Text(
                    incident.status.toUpperCase(),
                    style: const TextStyle(fontSize: 12),
                  ),
                  backgroundColor: _getStatusColor(incident.status).withOpacity(0.1),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Description
            Text(
              incident.description,
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),

            // Impact and Affected Components
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getIncidentColor(incident.impact).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${incident.impact.toUpperCase()} IMPACT',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: _getIncidentColor(incident.impact),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${incident.affectedComponents.length} affected service${incident.affectedComponents.length != 1 ? 's' : ''}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Timestamps
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 16,
                  color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                ),
                const SizedBox(width: 4),
                Text(
                  'Created: ${DateFormat('MMM dd, yyyy HH:mm').format(DateTime.parse(incident.createdAt))}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
                if (incident.resolvedAt != null) ...[
                  const SizedBox(width: 16),
                  Icon(
                    Icons.check_circle,
                    size: 16,
                    color: Colors.green[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Resolved: ${DateFormat('MMM dd, yyyy HH:mm').format(DateTime.parse(incident.resolvedAt!))}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.green[600],
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 12),

            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushNamed('/incidents/${incident.id}');
                  },
                  child: const Text('View Details'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    _showEditIncidentDialog(incident);
                  },
                  child: const Text('Edit'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showCreateIncidentDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create New Incident'),
        content: const Text('This feature is not yet implemented. In a real application, this would open a form to create a new incident.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showEditIncidentDialog(Incident incident) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit Incident: ${incident.title}'),
        content: const Text('This feature is not yet implemented. In a real application, this would open a form to edit the incident details.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Color _getIncidentColor(String impact) {
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

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'investigating':
        return Colors.orange;
      case 'identified':
        return Colors.blue;
      case 'monitoring':
        return Colors.purple;
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  IconData _getIncidentIcon(String impact) {
    switch (impact.toLowerCase()) {
      case 'critical':
        return Icons.cancel;
      case 'major':
        return Icons.error;
      case 'minor':
        return Icons.warning;
      default:
        return Icons.info;
    }
  }
}