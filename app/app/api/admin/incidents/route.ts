import { NextResponse } from 'next/server';
import incidentsService from "@/lib/services/incidents.service";
import { adminGuard } from "@/lib/guards/admin.guard";

export async function GET(request: Request) {
    const guardResponse = adminGuard(request);
    if (guardResponse) {
        return guardResponse;
    }

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
