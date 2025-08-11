import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';
import 'common/status_badges.dart';
import 'components/update_card.dart';

class StatusDashboard extends StatelessWidget {
  final List<Group>? groups;
  final List<Incident>? activeIncidents;
  final dynamic error;

  const StatusDashboard({
    super.key,
    required this.groups,
    required this.activeIncidents,
    this.error,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[50]
        : Colors.grey[900];
    final textColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[600]
        : Colors.grey[400];

    // Get responsive horizontal padding based on screen width
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = _getResponsiveHorizontalPadding(screenWidth);

    // If there's an error, render the error state
    if (error != null) {
      return Scaffold(
        backgroundColor: bgColor,
        body: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16.0),
            child: ErrorState(
              message: error is Exception ? error.toString() : 'An unexpected error occurred',
            ),
          ),
        ),
      );
    }

    // If groups is null, show loading state
    if (groups == null) {
      return Scaffold(
        backgroundColor: bgColor,
        body: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16.0),
            child: LoadingState(),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'System Status',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Last updated: ${DateFormat('MMM dd, yyyy HH:mm').format(DateTime.now())}',
                    style: TextStyle(
                      fontSize: 14,
                      color: textColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Overall Status
              _buildOverallStatus(context),
              const SizedBox(height: 16),

              // Active Incidents
              if (activeIncidents != null && activeIncidents!.isNotEmpty) ...[
                Text(
                  'Active Incidents',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                _buildActiveIncidentsGrid(context),
                const SizedBox(height: 16),
              ],

              // Service Groups
              Text(
                'Services',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              groups!.isEmpty
                  ? EmptyState()
                  : Column(
                children: groups!
                    .map((group) => _buildGroupCard(context, group))
                    .toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverallStatus(BuildContext context) {
    final overallStatus = _getOverallStatus();
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    Color bgColor = isDarkMode
        ? _getColorFromName(overallStatus['bgColorDark'])
        : _getColorFromName(overallStatus['bgColor']);
    Color textColor = isDarkMode
        ? _getColorFromName(overallStatus['colorDark'])
        : _getColorFromName(overallStatus['color']);

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: bgColor.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  overallStatus['icon'],
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    overallStatus['text'],
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    overallStatus['subtext'],
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).brightness == Brightness.light
                          ? Colors.grey[600]
                          : Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveIncidentsGrid(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Responsive grid for active incidents
        int crossAxisCount;
        double childAspectRatio;
        double crossAxisSpacing;
        double mainAxisSpacing;

        if (constraints.maxWidth > 1200) {
          // Large desktop: 2 columns for incidents
          print("LArge desktop");
          crossAxisCount = 2;
          childAspectRatio = 5.0;
          crossAxisSpacing = 16;
          mainAxisSpacing = 16;
        } else if (constraints.maxWidth > 900) {
          print("Desktop");

          // Desktop: 2 columns - cards will use vertical badge layout due to 480px threshold
          crossAxisCount = 2;
          childAspectRatio = 2.8;
          crossAxisSpacing = 16;
          mainAxisSpacing = 16;
        } else if (constraints.maxWidth > 600) {
          // Tablet: 1 column with good aspect ratio
          crossAxisCount = 1;
          childAspectRatio = 5.0;
          crossAxisSpacing = 12;
          mainAxisSpacing = 12;
        } else {
          // Mobile: 1 column with taller cards
          crossAxisCount = 1;
          childAspectRatio = 4.0;
          crossAxisSpacing = 8;
          mainAxisSpacing = 8;
        }

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: crossAxisSpacing,
            mainAxisSpacing: mainAxisSpacing,
            childAspectRatio: childAspectRatio,
          ),
          itemCount: activeIncidents!.length,
          itemBuilder: (context, index) {
            return UnifiedCard(
              incident: activeIncidents![index],
              style: UnifiedCardStyle.incidentCard,
              onTap: () {
                Navigator.of(context).pushNamed('/incident/${activeIncidents![index].id}');
              },
            );
          },
        );
      },
    );
  }


  Widget _buildGroupCard(BuildContext context, Group group) {
    final groupStatusString = _getGroupHighestSeverityStatus(group.components);
    final groupStatus = _getStatusStyles(groupStatusString);
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Group header
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDarkMode
                    ? _getColorFromName(groupStatus['bgColorDark']).withOpacity(0.2)
                    : _getColorFromName(groupStatus['bgColor']).withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          group.name,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          group.description,
                          style: TextStyle(
                            fontSize: 14,
                            color: Theme.of(context).brightness == Brightness.light
                                ? Colors.grey[600]
                                : Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ),
                  ComponentStatusBadge(
                    status: _getGroupHighestSeverityStatus(group.components),
                    showIcon: true,
                    fontSize: 12,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Components grid
            LayoutBuilder(
              builder: (context, constraints) {
                // Improved responsive breakpoints for better mobile experience
                int crossAxisCount;
                double childAspectRatio;
                double crossAxisSpacing;
                double mainAxisSpacing;

                if (constraints.maxWidth > 1200) {
                  // Large desktop: 4 columns
                  crossAxisCount = 4;
                  childAspectRatio = 3.5;
                  crossAxisSpacing = 16;
                  mainAxisSpacing = 16;
                } else if (constraints.maxWidth > 900) {
                  // Desktop: 3 columns
                  crossAxisCount = 3;
                  childAspectRatio = 3.2;
                  crossAxisSpacing = 16;
                  mainAxisSpacing = 16;
                } else if (constraints.maxWidth > 600) {
                  // Tablet: 2 columns
                  crossAxisCount = 2;
                  childAspectRatio = 3.0;
                  crossAxisSpacing = 12;
                  mainAxisSpacing = 12;
                } else if (constraints.maxWidth > 400) {
                  // Large mobile: 1 column with better aspect ratio
                  crossAxisCount = 1;
                  childAspectRatio = 5.0;
                  crossAxisSpacing = 8;
                  mainAxisSpacing = 8;
                } else {
                  // Small mobile: 1 column with taller cards
                  crossAxisCount = 1;
                  childAspectRatio = 4.0;
                  crossAxisSpacing = 8;
                  mainAxisSpacing = 8;
                }

                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    crossAxisSpacing: crossAxisSpacing,
                    mainAxisSpacing: mainAxisSpacing,
                    childAspectRatio: childAspectRatio,
                  ),
                  itemCount: group.components.length,
                  itemBuilder: (context, index) {
                    final component = group.components[index];

                    return Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.light
                            ? Colors.grey[50]
                            : Colors.grey[800],
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: Theme.of(context).brightness == Brightness.light
                              ? Colors.grey[200]!
                              : Colors.grey[700]!,
                          width: 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header with name and status
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  component.name,
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              ComponentStatusBadge(
                                status: component.status,
                                showIcon: true,
                                fontSize: 12,
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          // Description
                          Expanded(
                            child: Text(
                              component.description,
                              style: TextStyle(
                                fontSize: 12,
                                height: 1.3,
                                color: Theme.of(context).brightness == Brightness.light
                                    ? Colors.grey[600]
                                    : Colors.grey[400],
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }


  Map<String, dynamic> _getOverallStatus() {
    if (groups == null || groups!.isEmpty) {
      return {
        'icon': '✓',
        'text': 'All Systems Operational',
        'subtext': 'All core services are functioning normally',
        'bgColor': 'green.100',
        'color': 'green.700',
        'bgColorDark': 'green.800',
        'colorDark': 'green.200',
      };
    }

    int highestSeverity = 0;
    Map<String, int> statusCount = {
      'operational': 0,
      'degraded': 0,
      'partial': 0,
      'major': 0,
      'under_maintenance': 0,
    };

    for (var group in groups!) {
      for (var component in group.components) {
        final status = _getStatusStyles(component.status);
        if (status['severity'] > highestSeverity) {
          highestSeverity = status['severity'];
        }

        // Count status types
        statusCount[component.status] = (statusCount[component.status] ?? 0) + 1;
      }
    }

    // Determine overall status
    if ((statusCount['major'] ?? 0) > 0) {
      return {
        'icon': '×',
        'text': 'Major Service Outage',
        'subtext': 'Some services are experiencing major issues',
        'bgColor': 'red.100',
        'color': 'red.700',
        'bgColorDark': 'red.800',
        'colorDark': 'red.200',
      };
    } else if ((statusCount['partial'] ?? 0) > 0) {
      return {
        'icon': '!',
        'text': 'Partial Service Outage',
        'subtext': 'Some services are partially affected',
        'bgColor': 'orange.100',
        'color': 'orange.700',
        'bgColorDark': 'orange.800',
        'colorDark': 'orange.200',
      };
    } else if ((statusCount['degraded'] ?? 0) > 0) {
      return {
        'icon': '!',
        'text': 'Degraded Performance',
        'subtext': 'Some services are experiencing degraded performance',
        'bgColor': 'yellow.100',
        'color': 'yellow.700',
        'bgColorDark': 'yellow.800',
        'colorDark': 'yellow.200',
      };
    } else if ((statusCount['under_maintenance'] ?? 0) > 0) {
      return {
        'icon': '⚡',
        'text': 'Maintenance in Progress',
        'subtext': 'Some services are under maintenance',
        'bgColor': 'blue.100',
        'color': 'blue.700',
        'bgColorDark': 'blue.800',
        'colorDark': 'blue.200',
      };
    } else {
      return {
        'icon': '✓',
        'text': 'All Systems Operational',
        'subtext': 'All core services are functioning normally',
        'bgColor': 'green.100',
        'color': 'green.700',
        'bgColorDark': 'green.800',
        'colorDark': 'green.200',
      };
    }
  }


  String _getGroupHighestSeverityStatus(List<Component> components) {
    if (components.isEmpty) return 'operational';
    
    // Define severity order (higher number = more severe)
    Map<String, int> severityMap = {
      'operational': 0,
      'under_maintenance': 0,
      'degraded': 1,
      'partial': 2,
      'major': 3,
    };
    
    String highestStatus = 'operational';
    int highestSeverity = 0;
    
    for (var component in components) {
      int severity = severityMap[component.status] ?? 0;
      if (severity > highestSeverity) {
        highestSeverity = severity;
        highestStatus = component.status;
      }
    }
    
    return highestStatus;
  }

  bool _isAllOperational(List<Component> components) {
    return components.every((c) => c.status == 'operational');
  }

  Map<String, dynamic> _getStatusStyles(String status) {
    switch (status) {
      case 'operational':
        return {
          'bgColor': 'green.50',
          'bgColorDark': 'green.900',
          'color': 'green.700',
          'colorDark': 'green.200',
          'icon': '✓',
          'severity': 0,
          'displayText': 'Operational',
        };
      case 'degraded':
        return {
          'bgColor': 'yellow.50',
          'bgColorDark': 'yellow.900',
          'color': 'yellow.700',
          'colorDark': 'yellow.200',
          'icon': '!',
          'severity': 1,
          'displayText': 'Degraded',
        };
      case 'partial':
        return {
          'bgColor': 'orange.50',
          'bgColorDark': 'orange.900',
          'color': 'orange.700',
          'colorDark': 'orange.200',
          'icon': '!',
          'severity': 2,
          'displayText': 'Partial Outage',
        };
      case 'major':
        return {
          'bgColor': 'red.50',
          'bgColorDark': 'red.900',
          'color': 'red.700',
          'colorDark': 'red.200',
          'icon': '×',
          'severity': 3,
          'displayText': 'Major Outage',
        };
      case 'under_maintenance':
        return {
          'bgColor': 'blue.50',
          'bgColorDark': 'blue.900',
          'color': 'blue.700',
          'colorDark': 'blue.200',
          'icon': '⚡',
          'severity': 0,
          'displayText': 'Under Maintenance',
        };
      default:
        return {
          'bgColor': 'gray.50',
          'bgColorDark': 'gray.900',
          'color': 'gray.600',
          'colorDark': 'gray.400',
          'icon': '?',
          'severity': 0,
          'displayText': 'Unknown',
        };
    }
  }

  Color _getColorFromName(String colorName) {
    final parts = colorName.split('.');
    if (parts.length != 2) return Colors.grey;

    final colorFamily = parts[0];
    final shade = int.tryParse(parts[1]) ?? 500;

    switch (colorFamily) {
      case 'red':
        return Colors.red[shade] ?? Colors.red;
      case 'orange':
        return Colors.orange[shade] ?? Colors.orange;
      case 'yellow':
        return Colors.amber[shade] ?? Colors.amber;
      case 'green':
        return Colors.green[shade] ?? Colors.green;
      case 'blue':
        return Colors.blue[shade] ?? Colors.blue;
      case 'purple':
        return Colors.purple[shade] ?? Colors.purple;
      case 'gray':
      case 'grey':
        return Colors.grey[shade] ?? Colors.grey;
      default:
        return Colors.grey;
    }
  }

  /// Get responsive horizontal padding based on screen width
  double _getResponsiveHorizontalPadding(double screenWidth) {
    if (screenWidth < 600) {
      // Mobile: 16-24px padding
      return 16.0;
    } else if (screenWidth < 900) {
      // Small tablet: 24-40px padding
      return 24.0;
    } else if (screenWidth < 1200) {
      // Large tablet: 40-80px padding
      return 40.0;
    } else if (screenWidth < 1600) {
      // Desktop: 80-120px padding
      return 80.0;
    } else {
      // Large desktop: 120px+ padding
      return 120.0;
    }
  }
}

class ErrorState extends StatelessWidget {
  final String message;

  const ErrorState({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final textColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[600]
        : Colors.grey[400];

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Unable to Load System Status',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please try refreshing the page or contact support if the issue persists.',
              style: TextStyle(
                fontSize: 14,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class LoadingState extends StatelessWidget {
  const LoadingState({super.key});

  @override
  Widget build(BuildContext context) {
    final bgColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[100]
        : Colors.grey[800];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LayoutBuilder(
          builder: (context, constraints) => Skeleton(
            height: 40,
            width: constraints.maxWidth > 200 ? 200 : constraints.maxWidth * 0.8,
          ),
        ),
        const SizedBox(height: 16),
        const Skeleton(height: 80, width: double.infinity),
        const SizedBox(height: 24),
        LayoutBuilder(
          builder: (context, constraints) => Skeleton(
            height: 30,
            width: constraints.maxWidth > 150 ? 150 : constraints.maxWidth * 0.6,
          ),
        ),
        const SizedBox(height: 16),
        for (int i = 0; i < 3; i++) ...[
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LayoutBuilder(
                    builder: (context, constraints) => Skeleton(
                      height: 24,
                      width: constraints.maxWidth > 200 ? 200 : constraints.maxWidth * 0.7,
                    ),
                  ),
                  const SizedBox(height: 16),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      // Make skeleton containers responsive
                      final containerWidth = constraints.maxWidth > 600
                          ? (constraints.maxWidth - 16) / 2 // Two columns on larger screens
                          : constraints.maxWidth; // Full width on mobile

                      return Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: List.generate(
                          2,
                              (index) => Container(
                            width: containerWidth,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Skeleton(
                                  height: 20,
                                  width: containerWidth * 0.6, // 60% of container width
                                ),
                                const SizedBox(height: 8),
                                Skeleton(
                                  height: 16,
                                  width: containerWidth * 0.8, // 80% of container width
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ],
    );
  }
}

class Skeleton extends StatelessWidget {
  final double height;
  final double width;

  const Skeleton({
    super.key,
    required this.height,
    required this.width,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.light
            ? Colors.grey[300]
            : Colors.grey[700],
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    final textColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[600]
        : Colors.grey[400];

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'No Service Groups Available',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'There are currently no service groups to display. This could be because:',
              style: TextStyle(
                fontSize: 14,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '• The system is being initialized',
                  style: TextStyle(
                    fontSize: 14,
                    color: textColor,
                  ),
                ),
                Text(
                  '• Services are being configured',
                  style: TextStyle(
                    fontSize: 14,
                    color: textColor,
                  ),
                ),
                Text(
                  '• There might be a temporary issue',
                  style: TextStyle(
                    fontSize: 14,
                    color: textColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Please check back later or contact support if this persists.',
              style: TextStyle(
                fontSize: 14,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
