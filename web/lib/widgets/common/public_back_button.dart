import 'package:flutter/material.dart';

/// A reusable back button for public pages that navigates to the dashboard
/// and keeps styling consistent across the app.
class PublicBackButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const PublicBackButton({super.key, this.label = 'Back to Dashboard', this.onPressed});

  @override
  Widget build(BuildContext context) {
    final textColor = Theme.of(context).brightness == Brightness.light
        ? Colors.grey[600]
        : Colors.grey[400];

    return ElevatedButton.icon(
      onPressed: onPressed ?? () {
        // Always go to dashboard for consistency across public pages
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
      },
      icon: const Icon(Icons.arrow_back),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.transparent,
        foregroundColor: textColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
    );
  }
}
