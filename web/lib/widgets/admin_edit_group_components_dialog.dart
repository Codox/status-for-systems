import 'package:flutter/material.dart';
import '../models/uptime_data.dart';

class EditGroupComponentsDialog extends StatefulWidget {
  final Group group;
  final VoidCallback onComponentsUpdated;

  const EditGroupComponentsDialog({
    super.key,
    required this.group,
    required this.onComponentsUpdated,
  });

  @override
  State<EditGroupComponentsDialog> createState() => _EditGroupComponentsDialogState();
}

class _EditGroupComponentsDialogState extends State<EditGroupComponentsDialog> {
  List<Component> _allComponents = [];
  Set<String> _selectedComponentIds = {};
  bool _isLoading = false;
  bool _isUpdating = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadComponents();
  }

  Future<void> _loadComponents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final components = await UptimeDataService.fetchAllComponents();
      setState(() {
        _allComponents = components;
        // Pre-select components that are already in this group
        _selectedComponentIds = widget.group.components.map((c) => c.id).toSet();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load components: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _updateGroupComponents() async {
    setState(() {
      _isUpdating = true;
      _error = null;
    });

    try {
      await UptimeDataService.updateGroupComponents(
        groupId: widget.group.id,
        componentIds: _selectedComponentIds.toList(),
      );

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Group components updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
        widget.onComponentsUpdated();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to update group components: $e';
        _isUpdating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;

    return Dialog(
      child: Container(
        width: 600,
        constraints: const BoxConstraints(maxHeight: 700),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isLightMode ? Colors.green[50] : Colors.green[900],
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.edit,
                    color: Colors.green[600],
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Edit Components',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.green[600],
                          ),
                        ),
                        Text(
                          'Manage components for "${widget.group.name}"',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Error Message
                          if (_error != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.red[50],
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: Colors.red[200]!),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.error_outline, color: Colors.red[600]),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _error!,
                                      style: TextStyle(color: Colors.red[600]),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          // Group Info
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isLightMode ? Colors.grey[50] : Colors.grey[800],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey[300]!),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.folder,
                                  color: theme.primaryColor,
                                  size: 24,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        widget.group.name,
                                        style: theme.textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        widget.group.description,
                                        style: theme.textTheme.bodyMedium?.copyWith(
                                          color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Component Selection
                          Text(
                            'Select Components',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Choose which components belong to this group',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                            ),
                          ),
                          const SizedBox(height: 12),

                          if (_allComponents.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.orange[50],
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: Colors.orange[200]!),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.warning, color: Colors.orange[600]),
                                  const SizedBox(width: 8),
                                  const Expanded(
                                    child: Text('No components available. Create components first.'),
                                  ),
                                ],
                              ),
                            )
                          else
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Column(
                                children: _allComponents.map((component) {
                                  final isSelected = _selectedComponentIds.contains(component.id);
                                  return CheckboxListTile(
                                    title: Text(component.name),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(component.description),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(
                                              _getStatusIcon(component.status),
                                              color: _getStatusColor(component.status),
                                              size: 16,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              _formatStatusText(component.status),
                                              style: TextStyle(
                                                color: _getStatusColor(component.status),
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    value: isSelected,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        if (value == true) {
                                          _selectedComponentIds.add(component.id);
                                        } else {
                                          _selectedComponentIds.remove(component.id);
                                        }
                                      });
                                    },
                                  );
                                }).toList(),
                              ),
                            ),
                        ],
                      ),
                    ),
            ),

            // Footer
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isLightMode ? Colors.grey[50] : Colors.grey[800],
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(8),
                  bottomRight: Radius.circular(8),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${_selectedComponentIds.length} components selected',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                    ),
                  ),
                  Row(
                    children: [
                      TextButton(
                        onPressed: _isUpdating ? null : () => Navigator.of(context).pop(),
                        child: const Text('Cancel'),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: _isUpdating ? null : _updateGroupComponents,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green[600],
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        child: _isUpdating
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : const Text('Update Components'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatStatusText(String status) {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'partial':
        return 'Partial Outage';
      case 'major':
        return 'Major Outage';
      case 'under_maintenance':
        return 'Maintenance';
      default:
        return status.toUpperCase();
    }
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
}