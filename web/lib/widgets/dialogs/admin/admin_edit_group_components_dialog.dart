import 'package:flutter/material.dart';
import '../../../models/group.dart';
import '../../../models/component.dart';
import '../../../services/status_api_service.dart';
import '../../common/status_badges.dart';

class AdminEditGroupComponentsDialog extends StatefulWidget {
  final Group group;
  final VoidCallback onComponentsUpdated;

  const AdminEditGroupComponentsDialog({
    super.key,
    required this.group,
    required this.onComponentsUpdated,
  });

  @override
  State<AdminEditGroupComponentsDialog> createState() => _AdminEditGroupComponentsDialogState();
}

class _AdminEditGroupComponentsDialogState extends State<AdminEditGroupComponentsDialog> {
  List<Component> _allComponents = [];
  Set<String> _selectedComponentIds = {};
  bool _isLoading = false;
  bool _isUpdating = false;
  String? _error;
  
  // Controllers for editing group details
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.group.name);
    _descriptionController = TextEditingController(text: widget.group.description);
    _loadComponents();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadComponents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final components = await StatusApiService.fetchAllComponents();
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

  Future<void> _updateGroup() async {
    setState(() {
      _isUpdating = true;
      _error = null;
    });

    try {
      await StatusApiService.updateGroup(
        groupId: widget.group.id,
        name: _nameController.text.trim(),
        description: _descriptionController.text.trim(),
        components: _selectedComponentIds.toList(),
      );

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Group updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
        widget.onComponentsUpdated();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to update group: $e';
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
                          'Edit Group',
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

                          // Group Details Form
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isLightMode ? Colors.grey[50] : Colors.grey[800],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey[300]!),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.folder,
                                      color: theme.primaryColor,
                                      size: 24,
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      'Group Details',
                                      style: theme.textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                TextField(
                                  controller: _nameController,
                                  decoration: const InputDecoration(
                                    labelText: 'Group Name',
                                    border: OutlineInputBorder(),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                TextField(
                                  controller: _descriptionController,
                                  decoration: const InputDecoration(
                                    labelText: 'Description',
                                    border: OutlineInputBorder(),
                                  ),
                                  maxLines: 2,
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
                                              StatusUtils.getComponentStatusIcon(component.status),
                                              color: StatusUtils.getComponentStatusColor(component.status),
                                              size: 16,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              StatusUtils.getComponentStatusText(component.status),
                                              style: TextStyle(
                                                color: StatusUtils.getComponentStatusColor(component.status),
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
                        onPressed: _isUpdating ? null : _updateGroup,
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

}