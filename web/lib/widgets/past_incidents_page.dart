import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';
import '../services/config_service.dart';
import 'components/update_card.dart';
import 'common/public_back_button.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PastIncidentsPage extends StatefulWidget {
  const PastIncidentsPage({super.key});

  @override
  State<PastIncidentsPage> createState() => _PastIncidentsPageState();
}

class _PastIncidentsPageState extends State<PastIncidentsPage> {
  List<Incident> _allIncidents = [];
  bool _loading = true;
  String? _error;

  DateTime _fromDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _toDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadIncidents();
  }

  Future<void> _loadIncidents() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final apiUrl = ConfigService.apiUrl;
      if (apiUrl.isEmpty) {
        throw Exception('API URL is not configured');
      }

      // Build query parameters expected by backend: before and after (ISO8601 UTC)
      final before = _toDate.toUtc().toIso8601String();
      final after = _fromDate.toUtc().toIso8601String();
      final uri = Uri.parse('$apiUrl/public/incidents').replace(queryParameters: {
        'before': before,
        'after': after,
      });

      final response = await http.get(
        uri,
        headers: {
          'Accept': 'application/json',
        },
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to fetch incidents: ${response.statusCode}');
      }
      final List<dynamic> data = jsonDecode(response.body);
      final incidents = data.map((incident) => Incident(
        id: incident['_id'],
        title: incident['title'],
        description: incident['description'],
        status: incident['status'],
        impact: incident['impact'],
        affectedComponents: (incident['affectedComponents'] as List<dynamic>).map((component) => AffectedComponent(
          id: component['_id'],
          name: component['name'],
          status: component['status'],
        )).toList(),
        createdAt: incident['createdAt'],
        updatedAt: incident['updatedAt'],
        resolvedAt: incident['resolvedAt'],
      )).toList();
      // Sort by createdAt desc by default
      incidents.sort((a, b) => DateTime.parse(b.createdAt).compareTo(DateTime.parse(a.createdAt)));
      setState(() {
        _allIncidents = incidents;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _pickFromDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fromDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _fromDate = DateTime(picked.year, picked.month, picked.day);
        if (_fromDate.isAfter(_toDate)) {
          _toDate = _fromDate;
        }
      });
      // Reload incidents with new date range
      await _loadIncidents();
    }
  }

  Future<void> _pickToDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _toDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _toDate = DateTime(picked.year, picked.month, picked.day, 23, 59, 59, 999);
        if (_toDate.isBefore(_fromDate)) {
          _fromDate = DateTime(_toDate.year, _toDate.month, _toDate.day);
        }
      });
      // Reload incidents with new date range
      await _loadIncidents();
    }
  }

  List<Incident> get _filteredIncidents {
    // Include incidents that overlap with the selected date range.
    // If resolvedAt is null, consider it ongoing (use now).
    return _allIncidents.where((inc) {
      final created = DateTime.tryParse(inc.createdAt) ?? DateTime(1970);
      final resolved = inc.resolvedAt != null ? DateTime.tryParse(inc.resolvedAt!) : null;
      final effectiveEnd = resolved ?? DateTime.now();
      // overlap if created <= to and effectiveEnd >= from
      return !created.isAfter(_toDate) && !effectiveEnd.isBefore(_fromDate);
    }).toList();
  }

  String _formatDate(DateTime date) => DateFormat('MMM dd, yyyy').format(date);

  @override
  Widget build(BuildContext context) {
    final bgColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[50]
        : Colors.grey[900];
    final textColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[600]
        : Colors.grey[400];

    // responsive horizontal padding mirroring incident_detail_page
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = _getResponsiveHorizontalPadding(screenWidth);

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button similar to incident detail
              const PublicBackButton(),
              const SizedBox(height: 16),

              // Header similar to incident detail header
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Past Incidents',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Showing: ${_formatDate(_fromDate)} — ${_formatDate(_toDate)}',
                    style: TextStyle(
                      fontSize: 14,
                      color: textColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Filters Card with header bar
              Card(
                elevation: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.light
                            ? Colors.grey[100]
                            : Colors.grey[800],
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(8),
                          topRight: Radius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Filters',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: _DateField(
                                  label: 'From',
                                  value: DateFormat('MMM dd, yyyy').format(_fromDate),
                                  onTap: _pickFromDate,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _DateField(
                                  label: 'To',
                                  value: DateFormat('MMM dd, yyyy').format(_toDate),
                                  onTap: _pickToDate,
                                ),
                              ),
                              const SizedBox(width: 12),
                              IconButton(
                                tooltip: 'Reset to last 30 days',
                                onPressed: () async {
                                  setState(() {
                                    _fromDate = DateTime.now().subtract(const Duration(days: 30));
                                    _toDate = DateTime.now();
                                  });
                                  await _loadIncidents();
                                },
                                icon: const Icon(Icons.refresh),
                              )
                            ],
                          ),
                          if (_loading) ...[
                            const SizedBox(height: 12),
                            const LinearProgressIndicator(),
                          ],
                          if (_error != null) ...[
                            const SizedBox(height: 12),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Text('Error: $_error', style: TextStyle(color: Theme.of(context).colorScheme.error)),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Incidents list in a card, similar to Updates card layout
              Card(
                elevation: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.light
                            ? Colors.grey[100]
                            : Colors.grey[800],
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(8),
                          topRight: Radius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Incidents',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: _filteredIncidents.isEmpty
                          ? Text(
                              'No incidents found for the selected date range.',
                              style: Theme.of(context).textTheme.bodyLarge,
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: _filteredIncidents
                                  .map((incident) => UnifiedCard(
                                        incident: incident,
                                        style: UnifiedCardStyle.incidentCard,
                                        onTap: () => Navigator.of(context).pushNamed(
                                          '/incident/${incident.id}',
                                          arguments: {'from': 'history'},
                                        ),
                                      ))
                                  .toList(),
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

  /// Get responsive horizontal padding based on screen width (match incident detail)
  double _getResponsiveHorizontalPadding(double screenWidth) {
    if (screenWidth < 600) {
      return 16.0;
    } else if (screenWidth < 900) {
      return 24.0;
    } else if (screenWidth < 1200) {
      return 40.0;
    } else if (screenWidth < 1600) {
      return 80.0;
    } else {
      return 120.0;
    }
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;
  const _DateField({required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: InputDecorator(
        decoration: const InputDecoration(
          labelText: 'Date',
          border: OutlineInputBorder(),
          suffixIcon: Icon(Icons.calendar_today),
        ).copyWith(labelText: label),
        child: Text(value),
      ),
    );
  }
}
