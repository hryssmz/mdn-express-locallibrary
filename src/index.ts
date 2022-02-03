// index.ts
import app from "./app";
import { APP_HOST, APP_PORT, NODE_ENV } from "./env";

app.listen(APP_PORT, () => {
  console.log(`${NODE_ENV} server running on ${APP_HOST}:${APP_PORT}`);
});
