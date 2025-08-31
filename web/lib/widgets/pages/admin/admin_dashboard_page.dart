import 'package:flutter/material.dart';
import '../../../models/uptime_data.dart';
import '../../components/update_card.dart';
import '../../common/status_badges.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  List<Group>? groups;
  List<Incident>? incidents;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final fetchedGroups = await UptimeDataService.fetchGroups();
      final fetchedIncidents = await UptimeDataService.fetchActiveIncidents();

      setState(() {
        groups = fetchedGroups;
        incidents = fetchedIncidents;
        isLoading = false;
      });
    } catch (e) {
      // Check if it's an authentication error
      if (e.toString().contains('Authentication token')) {
        print('[DEBUG_LOG] Authentication error in admin dashboard, redirecting to login');
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/admin/login');
        }
        return;
      }

      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

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
              'Error loading data',
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
                _loadData();
              },
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dashboard',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Manage your system status and incidents',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Dashboard Content
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Recent Incidents
                    _buildRecentIncidents(),
                    const SizedBox(height: 24),

                    // Service Groups Overview
                    _buildServiceGroupsOverview(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildRecentIncidents() {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Incidents',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pushNamed('/admin/incidents');
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (incidents == null || incidents!.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 48,
                      color: Colors.green[400],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No active incidents',
                      style: theme.textTheme.titleMedium,
                    ),
                    Text(
                      'All systems are operational',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ...incidents!.take(3).map((incident) => UnifiedCard(
            incident: incident,
            style: UnifiedCardStyle.incidentList,
            showUpdatedTime: false,
            onTap: () {
              Navigator.of(context).pushNamed('/admin/incident/${incident.id}');
            },
          )),
      ],
    );
  }

  Widget _buildServiceGroupsOverview() {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Service Groups',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        if (groups == null || groups!.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Center(
                child: Text('No service groups found'),
              ),
            ),
          )
        else
          ...groups!.map((group) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ExpansionTile(
              shape: const Border(),
              leading: Icon(
                Icons.folder,
                color: theme.primaryColor,
              ),
              title: Text(group.name),
              subtitle: Text('${group.components.length} services'),
              children: group.components.map((component) => ListTile(
                leading: Icon(
                  StatusUtils.getComponentStatusIcon(component.status),
                  color: StatusUtils.getComponentStatusColor(component.status),
                  size: 20,
                ),
                title: Text(component.name),
                subtitle: Text(component.description),
                trailing: ComponentStatusBadge(
                  status: component.status,
                  showIcon: true,
                  fontSize: 10,
                ),
              )).toList(),
            ),
          )),
      ],
    );
  }

}

