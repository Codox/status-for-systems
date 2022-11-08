import {DataSource} from "typeorm";

export const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3308,
    username: "root",
    password: "therootpassword",
    database: "status_for_systems",
    synchronize: false,
})

export async function run() {
}
