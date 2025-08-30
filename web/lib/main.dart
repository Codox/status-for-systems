import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'models/uptime_data.dart';
import 'services/config_service.dart';
import 'widgets/pages/public/public_dashboard.dart';
import 'widgets/pages/public/public_incident_detail_page.dart';
import 'widgets/pages/public/public_past_incidents_page.dart';
import 'widgets/admin_layout.dart';
import 'widgets/admin_dashboard.dart';
import 'widgets/admin_incidents.dart';
import 'widgets/admin_components.dart';
import 'widgets/pages/admin/admin_incident_detail_page.dart';
import 'widgets/pages/login_page.dart';
import 'guards/auth_guard.dart';
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

  // Load configuration from config.json
  await ConfigService.loadConfig();

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
          : PublicDashboard(
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
  @override
  void initState() {
    super.initState();
    _updateDocumentTitle();
  }

  void _updateDocumentTitle() {
    if (kIsWeb) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        html.document.title = ConfigService.siteTitle;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: ConfigService.siteTitle,
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
        '/incidents': (context) => const PublicPastIncidentsPage(),
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
            builder: (context) => PublicIncidentDetailPage(incidentId: incidentId),
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
                child: AdminIncidentDetailPage(incidentId: incidentId),
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
