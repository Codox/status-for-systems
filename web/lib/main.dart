import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'models/uptime_data.dart';
import 'widgets/status_card.dart';
import 'widgets/status_dashboard.dart';

Future<void> main() async {
  // Load environment variables from .env file
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    // For web builds, try loading from assets
    // await dotenv.load(fileName: "assets/.env");
  }
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
      final fetchedGroups = await UptimeDataService.fetchGroups();
      final fetchedIncidents = await UptimeDataService.fetchActiveIncidents();

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

