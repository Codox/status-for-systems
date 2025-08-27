import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { Group } from '../groups/entities/group.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { IncidentUpdate } from '../incidents/entities/incident-update.entity';
import { GroupsService } from '../groups/groups.service';
import { IncidentsService } from '../incidents/incidents.service';
import { Feed } from 'feed';

@Controller('public')
export class PublicController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly incidentsService: IncidentsService,
  ) {}
  @Get('groups')
  async findAllGroups(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @Get('groups/:id')
  async findOneGroup(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @Get('incidents')
  async getIncidents(
    @Query('before') before?: string,
    @Query('after') after?: string,
  ): Promise<Incident[]> {
    const beforeDate = before ? new Date(before) : undefined;
    const afterDate = after ? new Date(after) : undefined;

    const isValidDate = (d?: Date) => d instanceof Date && !isNaN(d.getTime());

    if (isValidDate(beforeDate) || isValidDate(afterDate)) {
      const options: any = {};
      if (isValidDate(beforeDate)) options.before = beforeDate;
      if (isValidDate(afterDate)) options.after = afterDate;
      return this.incidentsService.all(options);
    }

    return this.incidentsService.all({ onlyActive: true });
  }

  @Get('incidents/:id')
  async getIncident(@Param('id') id: string): Promise<Incident> {
    return this.incidentsService.one(id);
  }

  @Get('incidents/:id/updates')
  async getIncidentUpdates(@Param('id') id: string): Promise<IncidentUpdate[]> {
    return this.incidentsService.getIncidentUpdates(id);
  }

  @Get('feed/rss')
  @Header('content-type', 'application/rss+xml')
  async getRSSFeed() {
    const {
      RSS_TITLE = 'Status Page Feed',
      RSS_DESCRIPTION = 'RSS feed for status page incidents',
      RSS_ID = process.env.RSS_LINK || 'http://localhost/',
      RSS_LINK = process.env.RSS_LINK || 'http://localhost/',
      RSS_COPYRIGHT = '',
      RSS_LANGUAGE = 'en',
      RSS_AUTHOR_NAME,
      RSS_AUTHOR_EMAIL,
    } = process.env as Record<string, string>;

    const feed = new Feed({
      title: RSS_TITLE,
      description: RSS_DESCRIPTION,
      id: RSS_ID,
      link: RSS_LINK,
      copyright: RSS_COPYRIGHT,
      updated: new Date(),
      language: RSS_LANGUAGE,
      author: RSS_AUTHOR_NAME
        ? {
            name: RSS_AUTHOR_NAME,
            email: RSS_AUTHOR_EMAIL,
          }
        : undefined,
    });

    // Add incidents and their updates as feed items
    const incidents = await this.incidentsService.all({});

    for (const incident of incidents) {
      // Add one item for the incident itself (summary)
      const incidentUrl = `${RSS_LINK.replace(/\/$/, '')}/public/incidents/${
        incident._id
      }`;
      feed.addItem({
        id: `${incident._id}`,
        title: `[${incident.status}] ${incident.title}`,
        link: incidentUrl,
        description: incident.description,
        date: incident.updatedAt || incident.createdAt || new Date(),
      });

      // Add items for each update ("incident posts")
      const updates = await this.incidentsService.getIncidentUpdates(
        incident._id.toString(),
      );
      for (const update of updates) {
        const parts: string[] = [];
        if (update.type) parts.push(`type: ${update.type}`);
        if (update.statusUpdate)
          parts.push(
            `status: ${update.statusUpdate.from || 'n/a'} -> ${
              update.statusUpdate.to
            }`,
          );
        if (update.impactUpdate)
          parts.push(
            `impact: ${update.impactUpdate.from || 'n/a'} -> ${
              update.impactUpdate.to
            }`,
          );
        if (update.componentStatusUpdates?.length) {
          parts.push(
            `components: ${update.componentStatusUpdates
              .map((c) => `${c.id}:${c.from}→${c.to}`)
              .join(', ')}`,
          );
        }
        const content = [update.description, parts.join(' | ')]
          .filter(Boolean)
          .join(' — ');
        feed.addItem({
          id: `${incident._id}:${update._id}`,
          title: `Update for ${incident.title}`,
          link: incidentUrl,
          description: content,
          date: update.createdAt || incident.updatedAt || new Date(),
        });
      }
    }

    return feed.rss2();
  }
}
