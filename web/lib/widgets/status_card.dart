import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/uptime_data.dart';

class StatusCard extends StatelessWidget {
  final Service service;
  
  const StatusCard({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  service.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                StatusIndicator(status: service.status),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Uptime: ${service.uptime.toStringAsFixed(1)}%',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              'Last checked: ${DateFormat('MMM dd, yyyy HH:mm').format(service.history.last.timestamp)}',
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            const Text(
              'Response Time (last 24h):',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 50,
              child: ResponseTimeSparkline(records: _getLast24Hours(service.history)),
            ),
          ],
        ),
      ),
    );
  }

  List<UptimeRecord> _getLast24Hours(List<UptimeRecord> history) {
    final now = DateTime.now();
    final yesterday = now.subtract(const Duration(hours: 24));
    return history.where((record) => record.timestamp.isAfter(yesterday)).toList();
  }
}

class StatusIndicator extends StatelessWidget {
  final String status;
  
  const StatusIndicator({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    
    switch (status.toLowerCase()) {
      case 'up':
        color = Colors.green;
        label = 'Operational';
        break;
      case 'degraded':
        color = Colors.orange;
        label = 'Degraded';
        break;
      case 'down':
        color = Colors.red;
        label = 'Down';
        break;
      default:
        color = Colors.grey;
        label = 'Unknown';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class ResponseTimeSparkline extends StatelessWidget {
  final List<UptimeRecord> records;
  
  const ResponseTimeSparkline({super.key, required this.records});

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return const Center(child: Text('No data available'));
    }
    
    // Simple sparkline implementation
    return CustomPaint(
      size: const Size(double.infinity, 50),
      painter: SparklinePainter(records),
    );
  }
}

class SparklinePainter extends CustomPainter {
  final List<UptimeRecord> records;
  
  SparklinePainter(this.records);
  
  @override
  void paint(Canvas canvas, Size size) {
    if (records.isEmpty) return;
    
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
      
    final path = Path();
    
    // Find max response time for scaling
    final maxResponseTime = records.map((r) => r.responseTime).reduce((a, b) => a > b ? a : b);
    
    // Start path at the first point
    final dx = size.width / (records.length - 1);
    final firstPoint = Offset(
      0, 
      size.height - (records.first.responseTime / maxResponseTime * size.height)
    );
    path.moveTo(firstPoint.dx, firstPoint.dy);
    
    // Add points to the path
    for (int i = 1; i < records.length; i++) {
      final record = records[i];
      final point = Offset(
        i * dx,
        size.height - (record.responseTime / maxResponseTime * size.height)
      );
      path.lineTo(point.dx, point.dy);
    }
    
    canvas.drawPath(path, paint);
  }
  
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}