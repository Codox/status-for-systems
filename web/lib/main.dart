import 'package:flutter/material.dart';
import 'models/uptime_data.dart';
import 'widgets/status_card.dart';
import 'widgets/status_dashboard.dart';

void main() {
  runApp(const MyApp());
}

// Define StatusPage class first
class StatusPage extends StatefulWidget {
  const StatusPage({super.key});

  @override
  State<StatusPage> createState() => _StatusPageState();
}

class _StatusPageState extends State<StatusPage> {
  List<Group>? groups;
  List<Incident>? activeIncidents;
  dynamic error;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  // Load data from API
  Future<void> _loadData() async {
    try {
      // Fetch data from API
      final fetchedGroups = await MockDataGenerator.fetchGroups();
      final fetchedIncidents = await MockDataGenerator.fetchActiveIncidents();

      setState(() {
        groups = fetchedGroups;
        activeIncidents = fetchedIncidents;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : StatusDashboard(
              groups: groups,
              activeIncidents: activeIncidents,
              error: error,
            ),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'System Status Dashboard',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.grey[100],
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.grey[900],
      ),
      themeMode: ThemeMode.system,
      home: const StatusPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

// Keep the legacy dashboard for reference
class UptimeDashboard extends StatefulWidget {
  const UptimeDashboard({super.key});

  @override
  State<UptimeDashboard> createState() => _UptimeDashboardState();
}

class _UptimeDashboardState extends State<UptimeDashboard> {
  late List<Service> services;
  Service? selectedService;

  @override
  void initState() {
    super.initState();
    // Load mock data
    services = MockDataGenerator.generateMockServices();
    // Initially select the first service
    if (services.isNotEmpty) {
      selectedService = services.first;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get screen width to adjust layout
    final screenWidth = MediaQuery.of(context).size.width;
    final isWideScreen = screenWidth > 1200;
    final isMediumScreen = screenWidth > 800 && screenWidth <= 1200;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Legacy Dashboard'),
        backgroundColor: Colors.white,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dashboard Header
              _buildDashboardHeader(),

              // Service Status Cards
              if (isWideScreen)
                // Wide screen layout
                _buildServiceCardsGrid(2)
              else if (isMediumScreen)
                // Medium screen layout (2 columns of cards)
                _buildServiceCardsGrid(2)
              else
                // Small screen layout (1 column)
                _buildServiceCards(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardHeader() {
    // Calculate overall system status
    final totalServices = services.length;
    final operationalServices = services.where((s) => s.status == 'up').length;
    final degradedServices = services.where((s) => s.status == 'degraded').length;
    final downServices = services.where((s) => s.status == 'down').length;

    // Determine overall system status
    String overallStatus = 'Operational';
    Color statusColor = Colors.green;

    if (downServices > 0) {
      overallStatus = 'Partial Outage';
      statusColor = Colors.red;
    } else if (degradedServices > 0) {
      overallStatus = 'Performance Issues';
      statusColor = Colors.orange;
    }

    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'System Status',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    overallStatus,
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatusSummary('Operational', operationalServices, totalServices, Colors.green),
                _buildStatusSummary('Degraded', degradedServices, totalServices, Colors.orange),
                _buildStatusSummary('Down', downServices, totalServices, Colors.red),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusSummary(String label, int count, int total, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '$count / $total',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildServiceCards() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 16.0),
          child: Text(
            'Services',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        ...services.map((service) => GestureDetector(
          onTap: () {
            setState(() {
              selectedService = service;
            });
          },
          child: Container(
            decoration: BoxDecoration(
              border: selectedService == service
                  ? Border.all(color: Colors.blue, width: 2)
                  : null,
              borderRadius: BorderRadius.circular(8),
            ),
            child: StatusCard(service: service),
          ),
        )).toList(),
      ],
    );
  }

  Widget _buildServiceCardsGrid(int columns) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 16.0),
          child: Text(
            'Services',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        GridView.count(
          crossAxisCount: columns,
          childAspectRatio: 1.5,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: services.map((service) => GestureDetector(
            onTap: () {
              setState(() {
                selectedService = service;
              });
            },
            child: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                border: selectedService == service
                    ? Border.all(color: Colors.blue, width: 2)
                    : null,
                borderRadius: BorderRadius.circular(8),
              ),
              child: StatusCard(service: service),
            ),
          )).toList(),
        ),
      ],
    );
  }
}
