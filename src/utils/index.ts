// utils/index.ts
import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from "../env";

const mongoBaseURL = DB_USER
  ? `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/`
  : `mongodb://${DB_HOST}:${DB_PORT}`;

export const mongoURL = `${mongoBaseURL}/${DB_NAME}`;
export const testMongoURL = `${mongoBaseURL}/test`;
