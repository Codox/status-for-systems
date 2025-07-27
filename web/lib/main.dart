import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'models/uptime_data.dart';
import 'widgets/status_card.dart';
import 'widgets/status_dashboard.dart';
import 'widgets/incident_detail_page.dart';
import 'widgets/admin_layout.dart';
import 'widgets/admin_dashboard.dart';
import 'widgets/admin_incidents.dart';
import 'widgets/admin_incident_detail.dart';

// Import for web URL strategy
import 'package:flutter_web_plugins/flutter_web_plugins.dart' if (dart.library.html) 'package:flutter_web_plugins/flutter_web_plugins.dart';

Future<void> main() async {
  // Configure URL strategy for web
  if (kIsWeb) {
    setUrlStrategy(PathUrlStrategy());
  }

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
      initialRoute: '/',
      routes: {
        '/': (context) => const StatusPage(),
        '/admin': (context) => const AdminLayout(
              currentRoute: '/admin',
              child: AdminDashboard(),
            ),
        '/admin/incidents': (context) => const AdminLayout(
              child: AdminIncidents(),
              currentRoute: '/admin/incidents',
            ),
      },
      onGenerateRoute: (settings) {
        if (settings.name?.startsWith('/incident/') == true) {
          final incidentId = settings.name!.substring('/incident/'.length);
          return MaterialPageRoute(
            builder: (context) => IncidentDetailPage(incidentId: incidentId),
            settings: settings,
          );
        }
        if (settings.name?.startsWith('/admin/incident/') == true) {
          final incidentId = settings.name!.substring('/admin/incident/'.length);
          return MaterialPageRoute(
            builder: (context) => AdminLayout(
              currentRoute: settings.name!,
              child: AdminIncidentDetail(incidentId: incidentId),
            ),
            settings: settings,
          );
        }
        return null;
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
