import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'models/uptime_data.dart';
import 'widgets/status_dashboard.dart';
import 'widgets/incident_detail_page.dart';
import 'widgets/admin_layout.dart';
import 'widgets/admin_dashboard.dart';
import 'widgets/admin_incidents.dart';
import 'widgets/admin_components.dart';
import 'widgets/admin_incident_detail.dart';
import 'widgets/login_page.dart';
import 'widgets/auth_guard.dart';
import 'package:http/http.dart' as http;


// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

import 'package:flutter_web_plugins/flutter_web_plugins.dart'
if (dart.library.html) 'package:flutter_web_plugins/flutter_web_plugins.dart';



Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Configure URL strategy for web
  if (kIsWeb) {
    setUrlStrategy(PathUrlStrategy());
  }

  // Load environment variables from .env file
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    // For web builds, try loading from assets if needed
    // await dotenv.load(fileName: "assets/.env");
  }

  runApp(MyApp());
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

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Map<String, dynamic> _config = {};
  String _siteTitle = 'Default Title';

  @override
  void initState() {
    super.initState();

    _loadConfig();
  }

  Future<void> _loadConfig() async {
    if (kIsWeb) {
      try {
        final response = await http.get(Uri.parse('/config.json'));
        if (response.statusCode == 200) {
          final config = json.decode(response.body);

          setState(() {
            _config = config;
            _siteTitle = config['siteTitle'] ?? _siteTitle;
          });

          WidgetsBinding.instance.addPostFrameCallback((_) {
            html.document.title = _siteTitle;
          });
        }
      } catch (e) {
        // Handle error or fallback here
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: _siteTitle, // Set app title from config (used by Flutter internally)
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
        '/admin/login': (context) => const LoginPage(),
        '/admin': (context) => const AuthGuard(
          currentRoute: '/admin',
          child: AdminLayout(
            currentRoute: '/admin',
            child: AdminDashboard(),
          ),
        ),
        '/admin/incidents': (context) => const AuthGuard(
          currentRoute: '/admin/incidents',
          child: AdminLayout(
            child: AdminIncidents(),
            currentRoute: '/admin/incidents',
          ),
        ),
        '/admin/components': (context) => const AuthGuard(
          currentRoute: '/admin/components',
          child: AdminLayout(
            child: AdminComponents(),
            currentRoute: '/admin/components',
          ),
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
            builder: (context) => AuthGuard(
              currentRoute: settings.name!,
              child: AdminLayout(
                currentRoute: settings.name!,
                child: AdminIncidentDetail(incidentId: incidentId),
              ),
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
