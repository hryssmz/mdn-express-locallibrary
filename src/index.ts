// index.ts
import app from "./app";
import { HOST, PORT, NODE_ENV } from "./env";

app.listen(PORT, HOST, () => {
  console.log(`${NODE_ENV} server running on ${HOST}:${PORT}`);
});
