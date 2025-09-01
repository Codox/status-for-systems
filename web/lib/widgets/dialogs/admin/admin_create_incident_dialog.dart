import 'package:flutter/material.dart';
import '../../../models/component.dart';
import '../../../services/status_api_service.dart';

class AdminCreateIncidentDialog extends StatefulWidget {
  final VoidCallback onIncidentCreated;

  const AdminCreateIncidentDialog({
    super.key,
    required this.onIncidentCreated,
  });

  @override
  State<AdminCreateIncidentDialog> createState() => _AdminCreateIncidentDialogState();
}

class _AdminCreateIncidentDialogState extends State<AdminCreateIncidentDialog> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String _selectedStatus = 'investigating';
  String _selectedImpact = 'minor';
  List<Component> _allComponents = [];
  Map<String, String> _selectedComponentStatuses = {}; // componentId -> status
  bool _isLoading = false;
  bool _isCreating = false;
  String? _error;

  final List<String> _statusOptions = [
    'investigating',
    'identified',
    'monitoring',
  ];

  final List<String> _impactOptions = [
    'critical',
    'major',
    'minor',
    'none',
  ];

  final List<String> _componentStatusOptions = [
    'operational',
    'degraded',
    'partial',
    'major',
  ];

  @override
  void initState() {
    super.initState();
    _loadComponents();
  }

  @override
  void dispose() {
    _titleController.dispose();
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
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load components: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _createIncident() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedComponentStatuses.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one affected component')),
      );
      return;
    }

    setState(() {
      _isCreating = true;
      _error = null;
    });

    try {
      // Convert component statuses to the format expected by the API
      final componentUpdates = _selectedComponentStatuses.entries
          .map((entry) => {'id': entry.key, 'status': entry.value})
          .toList();

      await StatusApiService.createIncident(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        status: _selectedStatus,
        impact: _selectedImpact,
        affectedComponents: componentUpdates,
      );

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Incident created successfully')),
        );
        widget.onIncidentCreated();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to create incident: $e';
        _isCreating = false;
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
                color: isLightMode ? Colors.grey[50] : Colors.grey[800],
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning, color: Colors.red[600], size: 24),
                  const SizedBox(width: 12),
                  Text(
                    'Create New Incident',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: _isCreating ? null : () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),

            // Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Error message
                      if (_error != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red[200]!),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.error_outline, color: Colors.red[600], size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _error!,
                                  style: TextStyle(color: Colors.red[700]),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Title field
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(
                          labelText: 'Incident Title *',
                          hintText: 'Brief description of the incident',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter an incident title';
                          }
                          return null;
                        },
                        enabled: !_isCreating,
                      ),
                      const SizedBox(height: 16),

                      // Description field
                      TextFormField(
                        controller: _descriptionController,
                        decoration: const InputDecoration(
                          labelText: 'Description *',
                          hintText: 'Detailed description of the incident',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 3,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter a description';
                          }
                          return null;
                        },
                        enabled: !_isCreating,
                      ),
                      const SizedBox(height: 16),

                      // Status and Impact dropdowns
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _selectedStatus,
                              decoration: const InputDecoration(
                                labelText: 'Status *',
                                border: OutlineInputBorder(),
                              ),
                              items: _statusOptions.map((status) {
                                return DropdownMenuItem(
                                  value: status,
                                  child: Text(status),
                                );
                              }).toList(),
                              onChanged: _isCreating ? null : (value) {
                                setState(() {
                                  _selectedStatus = value!;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _selectedImpact,
                              decoration: const InputDecoration(
                                labelText: 'Impact *',
                                border: OutlineInputBorder(),
                              ),
                              items: _impactOptions.map((impact) {
                                return DropdownMenuItem(
                                  value: impact,
                                  child: Text(impact),
                                );
                              }).toList(),
                              onChanged: _isCreating ? null : (value) {
                                setState(() {
                                  _selectedImpact = value!;
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Affected Components
                      Text(
                        'Affected Components *',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      if (_isLoading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (_allComponents.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('No components available'),
                        )
                      else
                        Container(
                          height: 300,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[300]!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ListView.builder(
                            itemCount: _allComponents.length,
                            itemBuilder: (context, index) {
                              final component = _allComponents[index];
                              final isSelected = _selectedComponentStatuses.containsKey(component.id);
                              final currentStatus = _selectedComponentStatuses[component.id] ?? 'degraded';
                              
                              return Card(
                                margin: const EdgeInsets.all(8),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Component selection checkbox
                                      Row(
                                        children: [
                                          Checkbox(
                                            value: isSelected,
                                            onChanged: _isCreating ? null : (bool? value) {
                                              setState(() {
                                                if (value == true) {
                                                  _selectedComponentStatuses[component.id] = 'degraded';
                                                } else {
                                                  _selectedComponentStatuses.remove(component.id);
                                                }
                                              });
                                            },
                                          ),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  component.name,
                                                  style: theme.textTheme.titleSmall?.copyWith(
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                                Text(
                                                  component.description,
                                                  style: theme.textTheme.bodySmall?.copyWith(
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      
                                      // Status dropdown (only shown when component is selected)
                                      if (isSelected) ...[
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            const SizedBox(width: 40), // Align with checkbox
                                            Expanded(
                                              child: DropdownButtonFormField<String>(
                                                value: currentStatus,
                                                decoration: const InputDecoration(
                                                  labelText: 'Component Status',
                                                  border: OutlineInputBorder(),
                                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                ),
                                                items: _componentStatusOptions.map((status) {
                                                  return DropdownMenuItem(
                                                    value: status,
                                                    child: Row(
                                                      children: [
                                                        _buildComponentStatusBadge(status),
                                                        const SizedBox(width: 8),
                                                        Text(status),
                                                      ],
                                                    ),
                                                  );
                                                }).toList(),
                                                onChanged: _isCreating ? null : (value) {
                                                  setState(() {
                                                    _selectedComponentStatuses[component.id] = value!;
                                                  });
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // Actions
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
                    onPressed: _isCreating ? null : () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _isCreating ? null : _createIncident,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red[600],
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    child: _isCreating
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Create Incident'),
                  ),
                ],
              ),
            ),
          ],
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
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}