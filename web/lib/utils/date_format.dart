import 'package:intl/intl.dart';

/// Date/time formatting utilities shared across the app.
class DateFormatUtils {
  DateFormatUtils._();

  // Patterns
  static final DateFormat _fullDateTime = DateFormat('MMM dd, yyyy HH:mm');
  static final DateFormat _fullDate = DateFormat('MMM dd, yyyy');

  // Formatters from DateTime
  static String formatDateTime(DateTime dt) => _fullDateTime.format(dt);
  static String formatDate(DateTime dt) => _fullDate.format(dt);

  // Formatters from ISO-8601 strings, with graceful fallback
  static String formatIsoDateTime(String iso) {
    try {
      return _fullDateTime.format(DateTime.parse(iso));
    } catch (_) {
      return iso; // fallback if parsing fails
    }
  }

  static String formatIsoDate(String iso) {
    try {
      return _fullDate.format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }
}
