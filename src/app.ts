// app.ts
import express from "express";
import { connect } from "mongoose";
import indexRouter from "./routes";

const app = express();

// Setup mongoose connection.
export const mongoURL = "mongodb://localhost:27017/local_library";
connect(mongoURL)
  .then(() => {
    console.log(`DB connection "${mongoURL}" established`);
  })
  .catch(console.error);

// Set up request body parser.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup routers.
app.use(indexRouter);

export default app;
