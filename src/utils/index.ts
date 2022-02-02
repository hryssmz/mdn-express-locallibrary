// utils/index.ts
const dbhost = process.env.DB_HOST || "localhost";
const dbport = process.env.DB_PORT || "27017";
const dbname = process.env.DB_NAME || "local_library";

export const mongoURL = `mongodb://${dbhost}:${dbport}/${dbname}`;
export const testMongoURL = `mongodb://${dbhost}:${dbport}/test`;
