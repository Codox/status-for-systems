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
    final headerBgColor = theme.brightness == Brightness.light 
        ? Colors.blue[500]! 
        : Colors.blue[600]!;

    return Scaffold(
      key: _scaffoldKey,
      appBar: isMobile ? _buildMobileAppBar(headerBgColor) : null,
      drawer: isMobile ? _buildDrawer() : null,
      body: Row(
        children: [
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
              ),
              child: _buildNavigationContent(headerBgColor),
            ),
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

  Widget _buildDrawer() {
    final theme = Theme.of(context);
    final headerBgColor = theme.brightness == Brightness.light 
        ? Colors.blue[500]! 
        : Colors.blue[600]!;

    return Drawer(
      child: _buildNavigationContent(headerBgColor),
    );
  }

  Widget _buildNavigationContent(Color headerBgColor) {
    return Column(
      children: [
        // Header
        Container(
          height: 64,
          width: double.infinity,
          color: headerBgColor,
          child: const Center(
            child: Text(
              'Dashboard',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        // Navigation Items
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Column(
              children: [
                ..._navigationItems.map((item) => _buildNavigationItem(item)),
              ],
            ),
          ),
        ),
        // Footer
        const Divider(),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              _buildBackToStatusPageButton(),
              const SizedBox(height: 4),
              _buildLogoutButton(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationItem(NavigationItem item) {
    final isActive = widget.currentRoute == item.route;
    final isMobile = MediaQuery.of(context).size.width < 768;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 2.0),
      child: Material(
        color: isActive ? (Theme.of(context).brightness == Brightness.light ? Colors.blue[50] : Colors.blue[900]) : Colors.transparent,
        borderRadius: BorderRadius.circular(4),
        child: InkWell(
          borderRadius: BorderRadius.circular(4),
          onTap: () {
            if (isMobile) {
              Navigator.of(context).pop(); // Close drawer
            }
            if (widget.currentRoute != item.route) {
              Navigator.of(context).pushReplacementNamed(item.route);
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                SizedBox(
                  width: 40,
                  child: Icon(
                    item.icon,
                    size: 20,
                    color: isActive 
                        ? Theme.of(context).primaryColor 
                        : Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
                Text(
                  item.name,
                  style: TextStyle(
                    fontWeight: isActive ? FontWeight.w500 : FontWeight.normal,
                    color: isActive 
                        ? Theme.of(context).primaryColor 
                        : Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBackToStatusPageButton() {
    final isMobile = MediaQuery.of(context).size.width < 768;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(4),
        child: InkWell(
          borderRadius: BorderRadius.circular(4),
          onTap: () {
            if (isMobile) {
              Navigator.of(context).pop(); // Close drawer
            }
            Navigator.of(context).pushReplacementNamed('/');
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                const SizedBox(
                  width: 40,
                  child: Icon(
                    Icons.arrow_back,
                    size: 20,
                  ),
                ),
                Text(
                  'Back to Status Page',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    final isMobile = MediaQuery.of(context).size.width < 768;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(4),
        child: InkWell(
          borderRadius: BorderRadius.circular(4),
          onTap: () async {
            if (isMobile) {
              Navigator.of(context).pop(); // Close drawer
            }

            // Show confirmation dialog
            final shouldLogout = await showDialog<bool>(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Logout'),
                content: const Text('Are you sure you want to logout?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    child: const Text('Logout'),
                  ),
                ],
              ),
            );

            if (shouldLogout == true) {
              await AuthService.logout();
              if (mounted) {
                Navigator.of(context).pushReplacementNamed('/admin/login');
              }
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                const SizedBox(
                  width: 40,
                  child: Icon(
                    Icons.logout,
                    size: 20,
                    color: Colors.red,
                  ),
                ),
                Text(
                  'Logout',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.red,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final String name;
  final String route;
  final IconData icon;

  NavigationItem({
    required this.name,
    required this.route,
    required this.icon,
  });
}
