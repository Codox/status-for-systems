import 'package:flutter/material.dart';
import '../../../services/auth_service.dart';

class AdminLayout extends StatefulWidget {
  final Widget child;
  final String currentRoute;

  const AdminLayout({
    super.key,
    required this.child,
    required this.currentRoute,
  });

  @override
  State<AdminLayout> createState() => _AdminLayoutState();
}

class _AdminLayoutState extends State<AdminLayout> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  static const double _drawerWidth = 240.0;

  final List<NavigationItem> _navigationItems = [
    NavigationItem(
      name: 'Dashboard',
      route: '/admin',
      icon: Icons.dashboard,
    ),
    NavigationItem(
      name: 'Incidents',
      route: '/admin/incidents',
      icon: Icons.warning,
    ),
    NavigationItem(
      name: 'Components',
      route: '/admin/components',
      icon: Icons.dns,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLightMode = theme.brightness == Brightness.light;
    final isMobile = MediaQuery.of(context).size.width < 768;

    final bgColor = isLightMode ? Colors.white : Colors.grey[800]!;
    final headerBgColor = isLightMode ? Colors.blue[500]! : Colors.blue[600]!;
    final activeBgColor = isLightMode ? Colors.blue[50]! : Colors.blue[900]!;
    final hoverBgColor = isLightMode ? Colors.grey[100]! : Colors.grey[700]!;

    return Scaffold(
      key: _scaffoldKey,
      appBar: isMobile ? _buildMobileAppBar(headerBgColor) : null,
      drawer: isMobile ? _buildDrawer(bgColor, activeBgColor, hoverBgColor) : null,
      body: Row(
        children: [
          // Desktop Sidebar
          if (!isMobile)
            Container(
              width: _drawerWidth,
              height: double.infinity,
              decoration: BoxDecoration(
                color: bgColor,
                border: Border(
                  right: BorderSide(
                    color: isLightMode ? Colors.grey[300]! : Colors.grey[600]!,
                    width: 1,
                  ),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(2, 0),
                  ),
                ],
              ),
              child: _buildNavigationContent(bgColor, activeBgColor, hoverBgColor, headerBgColor),
            ),
          // Main Content
          Expanded(
            child: Container(
              color: isLightMode ? Colors.grey[50] : Colors.grey[900],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: widget.child,
              ),
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildMobileAppBar(Color headerBgColor) {
    return AppBar(
      title: const Text(
        'Dashboard',
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
      backgroundColor: headerBgColor,
      iconTheme: const IconThemeData(color: Colors.white),
      leading: IconButton(
        icon: const Icon(Icons.menu),
        onPressed: () => _scaffoldKey.currentState?.openDrawer(),
      ),
    );
  }

  Widget _buildDrawer(Color bgColor, Color activeBgColor, Color hoverBgColor) {
    return Drawer(
      child: _buildNavigationContent(bgColor, activeBgColor, hoverBgColor, Colors.blue),
    );
  }

  Widget _buildNavigationContent(Color bgColor, Color activeBgColor, Color hoverBgColor, Color headerBgColor) {
    return Column(
      children: [
        // Header
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: headerBgColor,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Admin',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Manage your system',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),

        // Navigation List
        Expanded(
          child: ListView.builder(
            itemCount: _navigationItems.length + 1, // +1 for sign out
            itemBuilder: (context, index) {
              if (index < _navigationItems.length) {
                final item = _navigationItems[index];
                final isActive = widget.currentRoute == item.route;

                return MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: InkWell(
                    onTap: () {
                      if (widget.currentRoute != item.route) {
                        Navigator.of(context).pushReplacementNamed(item.route);
                      }
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isActive ? activeBgColor : Colors.transparent,
                        border: Border(
                          bottom: BorderSide(
                            color: Theme.of(context).brightness == Brightness.light
                                ? Colors.grey[300]!
                                : Colors.grey[700]!,
                          ),
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          Icon(
                            item.icon,
                            color: isActive ? Colors.blue[700] : Colors.grey[600],
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              item.name,
                              style: TextStyle(
                                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                                color: isActive ? Colors.blue[700] : null,
                              ),
                            ),
                          ),
                          if (isActive)
                            Container(
                              width: 4,
                              height: 24,
                              color: Colors.blue[700],
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              } else {
                // Sign Out button
                return Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        await AuthService.signOut();
                        if (mounted) {
                          Navigator.of(context).pushReplacementNamed('/admin/login');
                        }
                      },
                      icon: const Icon(Icons.logout),
                      label: const Text('Sign Out'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red[600],
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 48),
                      ),
                    ),
                  ),
                );
              }
            },
          ),
        ),
      ],
    );
  }
}

class NavigationItem {
  final String name;
  final String route;
  final IconData icon;

  NavigationItem({required this.name, required this.route, required this.icon});
}
