// index.ts
import app from "./app";

const port = 13002;

app.listen(port, () => {
  console.log("Server starting at port %s", port);
});
