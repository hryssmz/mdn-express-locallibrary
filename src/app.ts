// app.ts
import path from "path";
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

// Setup template engine.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Setup request body parser.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup static assets.
app.use(express.static(path.join(__dirname, "public")));

// Setup routers.
app.use(indexRouter);

export default app;
