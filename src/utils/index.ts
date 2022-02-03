// utils/index.ts
import { DB_ATLAS, DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from "../env";

const getMongoURL = (dbName: string) =>
  DB_ATLAS !== "TRUE"
    ? `mongodb://${DB_HOST}:${DB_PORT}/${dbName}`
    : `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${dbName}` +
      "?retryWrites=true&w=majority";

export const mongoURL = getMongoURL(DB_NAME);
export const testMongoURL = getMongoURL("test");
