// utils/index.ts
import { DB_HOST, DB_NAME, DB_PORT } from "../env";

const mongoBaseURL = `mongodb://${DB_HOST}:${DB_PORT}`;

export const mongoURL = `${mongoBaseURL}/${DB_NAME}`;
export const testMongoURL = `${mongoBaseURL}/test`;
