import {Controller, Get, Render} from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
    constructor() {}

    @Get()
    @Render('dashboard')
    index() {

    }
}
