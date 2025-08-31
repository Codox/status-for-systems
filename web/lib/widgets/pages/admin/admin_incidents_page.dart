import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../utils/date_format.dart';
import '../../../models/uptime_data.dart';
import '../../dialogs/admin/admin_create_incident_dialog.dart';
import '../../common/status_badges.dart';

class AdminIncidentsPage extends StatefulWidget {
  const AdminIncidentsPage({super.key});

  @override
  State<AdminIncidentsPage> createState() => _AdminIncidentsPageState();
}

class _AdminIncidentsPageState extends State<AdminIncidentsPage> {
  List<Incident>? incidents;
  bool isLoading = true;
  String? error;
  bool _isFABOpen = false;

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

  Future<void> _refreshIncidents() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    await _loadIncidents();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    if (error != null) {
      return Container(
        padding: const EdgeInsets.all(16),
        child: Card(
          color: Colors.red[50],
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(Icons.error_outline, color: Colors.red[600]),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Error Loading Incidents',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(error!, style: theme.textTheme.bodyMedium),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: _refreshIncidents,
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header (simplified - no buttons)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Incidents',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Manage and track system incidents',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Incidents Table
            Expanded(
              child: _buildIncidentsTable(),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFAB(),
    );
  }

  Widget _buildIncidentsTable() {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return Card(
      elevation: 2,
      child: Column(
        children: [
          // Table Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isLightMode ? Colors.grey[50] : Colors.grey[800],
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(8),
                topRight: Radius.circular(8),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'All Incidents (${incidents?.length ?? 0})',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${incidents?.where((i) => i.status != 'resolved').length ?? 0} active',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
              ],
            ),
          ),

          // Table Content
          Expanded(
            child: isLoading
                ? _buildLoadingState()
                : incidents == null || incidents!.isEmpty
                    ? _buildEmptyState()
                    : _buildTableContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Column(
      children: List.generate(3, (index) => 
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: Colors.grey[300]!),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 200,
                height: 16,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Container(
                width: 80,
                height: 16,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Container(
                width: 60,
                height: 16,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.warning_outlined,
              size: 48,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No incidents found',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'No incidents have been reported yet.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _showCreateIncidentDialog,
              icon: const Icon(Icons.add),
              label: const Text('Create First Incident'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[600],
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTableContent() {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return SingleChildScrollView(
      child: Table(
        columnWidths: const {
          0: FlexColumnWidth(3), // Incident
          1: FlexColumnWidth(1.5), // Status
          2: FlexColumnWidth(1), // Impact
          3: FlexColumnWidth(1), // Duration
          4: FlexColumnWidth(1.5), // Created
        },
        children: [
          // Table Header Row
          TableRow(
            decoration: BoxDecoration(
              color: isLightMode ? Colors.grey[100] : Colors.grey[700],
            ),
            children: [
              _buildTableHeader('Incident'),
              _buildTableHeader('Status', alignment: Alignment.center),
              _buildTableHeader('Impact', alignment: Alignment.center),
              _buildTableHeader('Duration', alignment: Alignment.center),
              _buildTableHeader('Created', alignment: Alignment.center),
            ],
          ),
          // Table Data Rows
          ...incidents!.map((incident) => TableRow(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: isLightMode ? Colors.grey[200]! : Colors.grey[700]!,
                ),
              ),
            ),
            children: [
              _buildIncidentCell(incident),
              _buildStatusCell(incident),
              _buildImpactCell(incident),
              _buildDurationCell(incident),
              _buildCreatedCell(incident),
            ],
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildTableHeader(String title, {Alignment alignment = Alignment.centerLeft}) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      alignment: alignment,
      child: Text(
        title,
        style: theme.textTheme.titleSmall?.copyWith(
          fontWeight: FontWeight.bold,
        ),
        textAlign: alignment == Alignment.center ? TextAlign.center : TextAlign.left,
      ),
    );
  }

  // Table cell builders
  Widget _buildIncidentCell(Incident incident) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return Container(
      padding: const EdgeInsets.all(12),
      alignment: Alignment.topLeft,
      constraints: const BoxConstraints(minHeight: 60),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pushNamed('/admin/incident/${incident.id}'),
            child: Text(
              incident.title,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w500,
                color: Colors.blue[600],
                decoration: TextDecoration.underline,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            incident.description,
            style: theme.textTheme.bodySmall?.copyWith(
              color: isLightMode ? Colors.grey[600] : Colors.grey[400],
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (incident.affectedComponents.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              '${incident.affectedComponents.length} component(s) affected',
              style: theme.textTheme.bodySmall?.copyWith(
                color: isLightMode ? Colors.grey[500] : Colors.grey[500],
                fontSize: 11,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusCell(Incident incident) {
    return Container(
      padding: const EdgeInsets.all(12),
      alignment: Alignment.center,
      constraints: const BoxConstraints(minHeight: 60),
      child: IncidentStatusBadge(
        status: incident.status,
        showIcon: true,
        fontSize: 12,
      ),
    );
  }

  Widget _buildImpactCell(Incident incident) {
    return Container(
      padding: const EdgeInsets.all(12),
      alignment: Alignment.center,
      constraints: const BoxConstraints(minHeight: 60),
      child: IncidentImpactBadge(
        impact: incident.impact,
        showLabel: false,
        fontSize: 12,
      ),
    );
  }

  Widget _buildDurationCell(Incident incident) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(12),
      alignment: Alignment.center,
      constraints: const BoxConstraints(minHeight: 60),
      child: Text(
        _calculateDuration(incident.createdAt, incident.resolvedAt),
        style: theme.textTheme.bodySmall,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _buildCreatedCell(Incident incident) {
    final theme = Theme.of(context);
    final createdDate = DateTime.parse(incident.createdAt);

    return Container(
      padding: const EdgeInsets.all(12),
      alignment: Alignment.center,
      constraints: const BoxConstraints(minHeight: 60),
      child: Tooltip(
        message: DateFormatUtils.formatIsoDateTime(incident.createdAt),
        child: Text(
          DateFormat('MMM dd, yyyy').format(createdDate),
          style: theme.textTheme.bodySmall?.copyWith(
            color: Theme.of(context).brightness == Brightness.light 
                ? Colors.grey[600] 
                : Colors.grey[400],
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }


  // Helper methods
  String _calculateDuration(String createdAt, String? resolvedAt) {
    final start = DateTime.parse(createdAt);
    final end = resolvedAt != null ? DateTime.parse(resolvedAt) : DateTime.now();
    final difference = end.difference(start);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ${difference.inHours % 24}h';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ${difference.inMinutes % 60}m';
    } else {
      return '${difference.inMinutes}m';
    }
  }

  // Centralized in DateFormatUtils


  void _showCreateIncidentDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AdminCreateIncidentDialog(
        onIncidentCreated: () {
          _refreshIncidents();
        },
      ),
    );
  }

  Widget _buildFAB() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Secondary FAB (Refresh - shown when speed dial is open)
        if (_isFABOpen) ...[
          FloatingActionButton(
            heroTag: "refresh",
            mini: true,
            onPressed: isLoading ? null : () {
              setState(() => _isFABOpen = false);
              _refreshIncidents();
            },
            backgroundColor: Colors.grey[600],
            child: isLoading 
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.refresh, color: Colors.white),
          ),
          const SizedBox(height: 8),
        ],
        
        // Primary FAB (New Incident)
        GestureDetector(
          onLongPress: () {
            // Long press toggles the speed dial for secondary actions
            setState(() => _isFABOpen = !_isFABOpen);
          },
          child: FloatingActionButton(
            heroTag: "primary",
            onPressed: () {
              if (_isFABOpen) {
                // If speed dial is open, close it and create incident
                setState(() => _isFABOpen = false);
                _showCreateIncidentDialog();
              } else {
                // If closed, directly create incident (most common action)
                _showCreateIncidentDialog();
              }
            },
            backgroundColor: Colors.red[600],
            child: AnimatedRotation(
              turns: _isFABOpen ? 0.125 : 0, // 45 degree rotation when open
              duration: const Duration(milliseconds: 200),
              child: Icon(
                _isFABOpen ? Icons.close : Icons.add,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
