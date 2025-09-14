export class IncidentCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: string,
    public readonly impact: string,
  ) {}
}
