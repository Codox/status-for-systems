import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';
import 'admin_create_component_dialog.dart';
import 'admin_create_group_dialog.dart';

class AdminComponents extends StatefulWidget {
  const AdminComponents({super.key});

  @override
  State<AdminComponents> createState() => _AdminComponentsState();
}

class _AdminComponentsState extends State<AdminComponents> {
  List<Group>? groups;
  bool isLoading = true;
  String? error;
  bool _isFABOpen = false;

  @override
  void initState() {
    super.initState();
    _loadComponents();
  }

  Future<void> _loadComponents() async {
    try {
      final fetchedGroups = await UptimeDataService.fetchGroups();
      setState(() {
        groups = fetchedGroups;
        isLoading = false;
      });
    } catch (e) {
      // Check if it's an authentication error
      if (e.toString().contains('Authentication token')) {
        print('[DEBUG_LOG] Authentication error in admin components, redirecting to login');
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

  Future<void> _refreshComponents() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    await _loadComponents();
  }

  void _showCreateComponentDialog() {
    showDialog(
      context: context,
      builder: (context) => CreateComponentDialog(
        onComponentCreated: _refreshComponents,
      ),
    );
  }

  void _showCreateGroupDialog() {
    showDialog(
      context: context,
      builder: (context) => CreateGroupDialog(
        onGroupCreated: _refreshComponents,
      ),
    );
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
                        'Error Loading Components',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(error!, style: theme.textTheme.bodyMedium),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: _refreshComponents,
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
                  'Components',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Manage system components and assign them to groups',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Components Table
            Expanded(
              child: _buildComponentsTable(),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFAB(),
    );
  }

  Widget _buildComponentsTable() {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    final totalComponents = groups?.fold<int>(0, (sum, group) => sum + group.components.length) ?? 0;

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
                  'All Components ($totalComponents)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${groups?.length ?? 0} groups',
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
                : groups == null || groups!.isEmpty
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
                width: 40,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 16,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 200,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(4),
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

  Widget _buildEmptyState() {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.dns,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No components found',
              style: theme.textTheme.titleLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Create your first component to get started',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _showCreateComponentDialog,
              icon: const Icon(Icons.add),
              label: const Text('Create Component'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTableContent() {
    return ListView.builder(
      itemCount: groups!.length,
      itemBuilder: (context, index) {
        final group = groups![index];
        return _buildGroupCard(group);
      },
    );
  }

  Widget _buildGroupCard(Group group) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return Card(
      margin: const EdgeInsets.all(8),
      child: ExpansionTile(
        leading: Icon(
          Icons.folder,
          color: theme.primaryColor,
        ),
        title: Text(
          group.name,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(group.description),
            const SizedBox(height: 4),
            Text(
              '${group.components.length} components',
              style: theme.textTheme.bodySmall?.copyWith(
                color: isLightMode ? Colors.grey[600] : Colors.grey[400],
              ),
            ),
          ],
        ),
        children: group.components.isEmpty
            ? [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'No components in this group',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[500],
                    ),
                  ),
                ),
              ]
            : group.components.map((component) => _buildComponentTile(component)).toList(),
      ),
    );
  }

  Widget _buildComponentTile(Component component) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return ListTile(
      leading: Icon(
        _getStatusIcon(component.status),
        color: _getStatusColor(component.status),
        size: 20,
      ),
      title: Text(component.name),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(component.description),
          const SizedBox(height: 4),
          Text(
            'Created: ${DateFormat('MMM dd, yyyy').format(DateTime.parse(component.createdAt))}',
            style: theme.textTheme.bodySmall?.copyWith(
              color: isLightMode ? Colors.grey[600] : Colors.grey[400],
            ),
          ),
        ],
      ),
      trailing: Chip(
        label: Text(
          component.status.toUpperCase(),
          style: const TextStyle(fontSize: 10),
        ),
        backgroundColor: _getStatusColor(component.status).withOpacity(0.1),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'operational':
        return Colors.green;
      case 'degraded':
        return Colors.yellow[700]!;
      case 'partial':
        return Colors.orange;
      case 'major':
        return Colors.red;
      case 'under_maintenance':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'operational':
        return Icons.check_circle;
      case 'degraded':
        return Icons.warning;
      case 'partial':
        return Icons.error;
      case 'major':
        return Icons.cancel;
      case 'under_maintenance':
        return Icons.build;
      default:
        return Icons.help;
    }
  }

  Widget _buildFAB() {
    return Stack(
      children: [
        // Backdrop overlay when menu is open
        if (_isFABOpen)
          Positioned.fill(
            child: GestureDetector(
              onTap: () => setState(() => _isFABOpen = false),
              child: Container(
                color: Colors.black.withOpacity(0.3),
              ),
            ),
          ),
        
        // FAB Menu List (shown when open)
        if (_isFABOpen)
          Positioned(
            bottom: 80, // Position above the main FAB
            right: 0,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: Theme.of(context).cardColor,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Create Group Option
                    ListTile(
                      leading: Icon(
                        Icons.folder_outlined,
                        color: Colors.green[600],
                      ),
                      title: const Text('Create Group'),
                      subtitle: const Text('New component group'),
                      onTap: () {
                        setState(() => _isFABOpen = false);
                        _showCreateGroupDialog();
                      },
                    ),
                    const Divider(height: 1),
                    
                    // Create Component Option
                    ListTile(
                      leading: Icon(
                        Icons.dns,
                        color: Colors.blue[600],
                      ),
                      title: const Text('Create Component'),
                      subtitle: const Text('New system component'),
                      onTap: () {
                        setState(() => _isFABOpen = false);
                        _showCreateComponentDialog();
                      },
                    ),
                    const Divider(height: 1),
                    
                    // Refresh Option
                    ListTile(
                      leading: Icon(
                        Icons.refresh,
                        color: Colors.grey[600],
                      ),
                      title: const Text('Refresh'),
                      subtitle: const Text('Reload components'),
                      enabled: !isLoading,
                      onTap: isLoading ? null : () {
                        setState(() => _isFABOpen = false);
                        _refreshComponents();
                      },
                      trailing: isLoading 
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : null,
                    ),
                  ],
                ),
              ),
            ),
          ),
        
        // Main FAB
        Positioned(
          bottom: 0,
          right: 0,
          child: FloatingActionButton(
            heroTag: "primary",
            onPressed: () {
              setState(() => _isFABOpen = !_isFABOpen);
            },
            backgroundColor: Colors.blue[600],
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

  // Add method to handle primary action (New Component)
  void _handlePrimaryFABAction() {
    if (_isFABOpen) {
      setState(() => _isFABOpen = false);
    }
    _showCreateComponentDialog();
  }
}