import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/uptime_data.dart';
import '../../admin_create_component_dialog.dart';
import '../../admin_create_group_dialog.dart';
import '../../admin_edit_group_components_dialog.dart';
import '../../admin_edit_component_dialog.dart';
import '../../common/status_badges.dart';

class AdminComponentsPage extends StatefulWidget {
  const AdminComponentsPage({super.key});

  @override
  State<AdminComponentsPage> createState() => _AdminComponentsPageState();
}

class _AdminComponentsPageState extends State<AdminComponentsPage> {
  List<Group>? groups;
  List<Component>? allComponents;
  List<Component>? ungroupedComponents;
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
      // Always fetch all components and groups to show both grouped and ungrouped
      final fetchedAllComponents = await UptimeDataService.fetchAllComponents();
      final fetchedGroups = await UptimeDataService.fetchGroups();
      
      // Get all component IDs that are in groups
      final groupedComponentIds = <String>{};
      for (final group in fetchedGroups) {
        for (final component in group.components) {
          groupedComponentIds.add(component.id);
        }
      }
      
      // Filter out components that are already in groups
      final fetchedUngroupedComponents = fetchedAllComponents
          .where((component) => !groupedComponentIds.contains(component.id))
          .toList();
      
      setState(() {
        allComponents = fetchedAllComponents;
        groups = fetchedGroups;
        ungroupedComponents = fetchedUngroupedComponents;
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

  void _showEditGroupComponentsDialog(Group group) {
    showDialog(
      context: context,
      builder: (context) => EditGroupComponentsDialog(
        group: group,
        onComponentsUpdated: _refreshComponents,
      ),
    );
  }

  void _showEditComponentDialog(Component component) {
    showDialog(
      context: context,
      builder: (context) => EditComponentDialog(
        component: component,
        onComponentUpdated: _refreshComponents,
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
            // Header
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

            // Components Content
            Expanded(
              child: isLoading
                  ? _buildLoadingState()
                  : _buildComponentsContent(),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFAB(),
    );
  }

  Widget _buildComponentsContent() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Groups Section
          _buildGroupsSection(),
          const SizedBox(height: 24),
          // Ungrouped Components Section
          _buildUngroupedSection(),
        ],
      ),
    );
  }

  Widget _buildGroupsSection() {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;
    final totalGroupedComponents = groups?.fold<int>(0, (sum, group) => sum + group.components.length) ?? 0;

    return Card(
      elevation: 2,
      child: Column(
        children: [
          // Groups Header
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
                  'Grouped Components ($totalGroupedComponents)',
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

          // Groups Content
          groups == null || groups!.isEmpty
              ? _buildEmptyState()
              : _buildGroupsContent(),
        ],
      ),
    );
  }

  Widget _buildUngroupedSection() {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;
    final ungroupedCount = ungroupedComponents?.length ?? 0;

    return Card(
      elevation: 2,
      child: Column(
        children: [
          // Ungrouped Header
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
                  'Ungrouped Components ($ungroupedCount)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Not assigned to any group',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                  ),
                ),
              ],
            ),
          ),

          // Ungrouped Content
          ungroupedComponents == null || ungroupedComponents!.isEmpty
              ? _buildEmptyUngroupedState()
              : _buildUngroupedContent(),
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
              style: ElevatedButton.styleFrom(
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

  Widget _buildEmptyUngroupedState() {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
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
              'All components are grouped',
              style: theme.textTheme.titleLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Every component has been assigned to a group',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _showCreateComponentDialog,
              icon: const Icon(Icons.add),
              label: const Text('Create Component'),
              style: ElevatedButton.styleFrom(
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

  Widget _buildUngroupedContent() {
    return Container(
      constraints: const BoxConstraints(
        maxHeight: 400,
      ),
      child: ListView.builder(
        shrinkWrap: true,
        itemCount: ungroupedComponents!.length,
        itemBuilder: (context, index) {
          final component = ungroupedComponents![index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: _buildComponentTile(component),
          );
        },
      ),
    );
  }

  Widget _buildGroupsContent() {
    return Column(
      children: groups!.map((group) => _buildGroupCard(group)).toList(),
    );
  }

  Widget _buildGroupCard(Group group) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return Card(
      margin: const EdgeInsets.all(8),
      child: ExpansionTile(
        shape: const Border(),
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
        trailing: IconButton(
          onPressed: () => _showEditGroupComponentsDialog(group),
          icon: Icon(
            Icons.edit,
            color: Colors.green[600],
          ),
          tooltip: 'Edit Components',
        ),
        children: [
          // Components list
          ...group.components.isEmpty
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
        ],
      ),
    );
  }

  Widget _buildComponentTile(Component component) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return ListTile(
      leading: Icon(
        StatusUtils.getComponentStatusIcon(component.status),
        color: StatusUtils.getComponentStatusColor(component.status),
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
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          ComponentStatusBadge(
            status: component.status,
            showIcon: true,
            fontSize: 10,
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: () => _showEditComponentDialog(component),
            icon: Icon(
              Icons.edit,
              color: Colors.blue[600],
              size: 20,
            ),
            tooltip: 'Edit Component',
            constraints: const BoxConstraints(
              minWidth: 32,
              minHeight: 32,
            ),
            padding: const EdgeInsets.all(4),
          ),
        ],
      ),
    );
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
              borderRadius: BorderRadius.circular(4),
              child: Container(
                width: 250,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
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