/// Responsive utilities shared across widgets.
library responsive_utils;

/// Returns a sensible horizontal padding value based on the provided screen width.
///
/// Breakpoints are tuned for web layouts used in this app.
/// - < 600: 16
/// - < 900: 24
/// - < 1200: 40
/// - < 1600: 80
/// - otherwise: 120
double getResponsiveHorizontalPadding(double screenWidth) {
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
