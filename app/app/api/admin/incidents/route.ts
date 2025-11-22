import { NextResponse } from 'next/server';
import incidentsService from "@/lib/services/incidents.service";
import { validateRequest } from '@/lib/utils/validation.utils';
import { CreateIncidentRequest } from '@/lib/requests/create-incident.request';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const beforeParam = searchParams.get('before');
        const afterParam = searchParams.get('after');
        const onlyActiveParam = searchParams.get('onlyActive');

        const options: {
            before?: Date;
            after?: Date;
            onlyActive?: boolean;
        } = {};

        if (beforeParam) {
            const beforeDate = new Date(beforeParam);
            if (!isNaN(beforeDate.getTime())) {
                options.before = beforeDate;
            }
        }

        if (afterParam) {
            const afterDate = new Date(afterParam);
            if (!isNaN(afterDate.getTime())) {
                options.after = afterDate;
            }
        }

        if (onlyActiveParam) {
            options.onlyActive = onlyActiveParam === 'true';
        }

        const incidents = await incidentsService.getIncidents(options);

        return NextResponse.json(incidents, { status: 200 });
    } catch (error) {
        console.error('Error fetching incidents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch incidents' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request body
        const validation = await validateRequest(CreateIncidentRequest, body);

        if (!validation.valid) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.errors },
                { status: 400 }
            );
        }

        const data = validation.data!;

        // Create incident
        const incident = await incidentsService.createIncident({
            title: data.title,
            description: data.description,
            status: data.status,
            impact: data.impact,
            affectedComponents: data.affectedComponents,
        });

        return NextResponse.json(incident, { status: 201 });
    } catch (error) {
        console.error('Error creating incident:', error);
        return NextResponse.json(
            { error: 'Failed to create incident' },
            { status: 500 }
        );
    }
}
