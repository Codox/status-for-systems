import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { Group } from '../groups/entities/group.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { IncidentUpdate } from '../incidents/entities/incident-update.entity';
import { GroupsService } from '../groups/groups.service';
import { IncidentsService } from '../incidents/incidents.service';
import { Feed } from 'feed';
import { map, pipe, sortBy, take } from 'remeda';

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
      RSS_MAX_ITEMS,
    } = process.env as Record<string, string>;

    const maxItems = Number(RSS_MAX_ITEMS) > 0 ? Number(RSS_MAX_ITEMS) : 50;

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

    // Lightweight feed: one concise item per incident, limited count
    const incidents = await this.incidentsService.all({});

    pipe(
      incidents,
      sortBy([
        (i) => (i.updatedAt || i.createdAt || new Date(0)).getTime(),
        'desc',
      ]),
      take(maxItems),
      map((incident) => {
        const incidentUrl = `${RSS_LINK.replace(/\/$/, '')}/public/incidents/${
          incident._id
        }`;

        const rawDesc = incident.description || '';
        const trimmed =
          rawDesc.length > 200 ? `${rawDesc.slice(0, 200)}…` : rawDesc;
        const summaryBits = [
          `status: ${incident.status}`,
          `impact: ${incident.impact}`,
        ];
        const description = [trimmed, summaryBits.join(' | ')]
          .filter(Boolean)
          .join(' — ');

        feed.addItem({
          id: `${incident._id}`,
          title: `[${incident.status}] ${incident.title}`,
          link: incidentUrl,
          description,
          date: incident.updatedAt || incident.createdAt || new Date(),
        });

        return null;
      }),
    );

    return feed.rss2();
  }
}
