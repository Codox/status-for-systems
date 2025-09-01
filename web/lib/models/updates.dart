class StatusUpdate {
  final String? from;
  final String to;

  StatusUpdate({
    this.from,
    required this.to,
  });
}

class ImpactUpdate {
  final String from;
  final String to;

  ImpactUpdate({
    required this.from,
    required this.to,
  });
}

class ComponentStatusUpdate {
  final String id;
  final String from;
  final String to;
  final String updateId;

  ComponentStatusUpdate({
    required this.id,
    required this.from,
    required this.to,
    required this.updateId,
  });
}

class Update {
  final String id;
  final String type;
  final String? description;
  final StatusUpdate? statusUpdate;
  final ImpactUpdate? impactUpdate;
  final List<ComponentStatusUpdate>? componentStatusUpdates;
  final String createdAt;

  Update({
    required this.id,
    required this.type,
    this.description,
    this.statusUpdate,
    this.impactUpdate,
    this.componentStatusUpdates,
    required this.createdAt,
  });
}
