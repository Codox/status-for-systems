import 'package:flutter/material.dart';
import '../../../models/uptime_data.dart';

class AdminEditComponentDialog extends StatefulWidget {
  final Component component;
  final VoidCallback onComponentUpdated;

  const AdminEditComponentDialog({
    super.key,
    required this.component,
    required this.onComponentUpdated,
  });

  @override
  State<AdminEditComponentDialog> createState() => _AdminEditComponentDialogState();
}

class _AdminEditComponentDialogState extends State<AdminEditComponentDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;
  
  List<Group> _allGroups = [];
  Set<String> _selectedGroupIds = {}; // Set of group IDs
  bool _isLoading = false;
  bool _isUpdating = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.component.name);
    _descriptionController = TextEditingController(text: widget.component.description);
    _loadGroups();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadGroups() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final groups = await UptimeDataService.fetchGroups();
      
      // Find which groups currently contain this component
      final currentGroupIds = <String>{};
      for (final group in groups) {
        for (final component in group.components) {
          if (component.id == widget.component.id) {
            currentGroupIds.add(group.id);
            break;
          }
        }
      }
      
      setState(() {
        _allGroups = groups;
        _selectedGroupIds = currentGroupIds;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load groups: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _updateComponent() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedGroupIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one group')),
      );
      return;
    }

    setState(() {
      _isUpdating = true;
      _error = null;
    });

    try {
      await UptimeDataService.updateComponent(
        componentId: widget.component.id,
        name: _nameController.text.trim(),
        description: _descriptionController.text.trim(),
        groups: _selectedGroupIds.toList(),
      );

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Component updated successfully'),
            backgroundColor: Colors.blue,
          ),
        );
        widget.onComponentUpdated();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to update component: $e';
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
                color: isLightMode ? Colors.blue[50] : Colors.blue[900],
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.edit,
                    color: Colors.blue[600],
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Edit Component',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue[600],
                          ),
                        ),
                        Text(
                          'Update component details and group assignments',
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
                      child: Form(
                        key: _formKey,
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

                            // Component Name
                            TextFormField(
                              controller: _nameController,
                              decoration: const InputDecoration(
                                labelText: 'Component Name',
                                hintText: 'e.g., API Server, Database, CDN',
                                border: OutlineInputBorder(),
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Please enter a component name';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),

                            // Component Description
                            TextFormField(
                              controller: _descriptionController,
                              decoration: const InputDecoration(
                                labelText: 'Description',
                                hintText: 'Brief description of the component',
                                border: OutlineInputBorder(),
                              ),
                              maxLines: 3,
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Please enter a description';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 24),

                            // Group Selection
                            Text(
                              'Assign to Groups',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Select one or more groups for this component',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: isLightMode ? Colors.grey[600] : Colors.grey[400],
                              ),
                            ),
                            const SizedBox(height: 12),

                            if (_allGroups.isEmpty)
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
                                      child: Text('No groups available. Create a group first.'),
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
                                  children: _allGroups.map((group) {
                                    final isSelected = _selectedGroupIds.contains(group.id);
                                    return CheckboxListTile(
                                      title: Text(group.name),
                                      subtitle: Text(group.description),
                                      value: isSelected,
                                      onChanged: (bool? value) {
                                        setState(() {
                                          if (value == true) {
                                            _selectedGroupIds.add(group.id);
                                          } else {
                                            _selectedGroupIds.remove(group.id);
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
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: _isUpdating ? null : () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _isUpdating ? null : _updateComponent,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[600],
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
                        : const Text('Update Component'),
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