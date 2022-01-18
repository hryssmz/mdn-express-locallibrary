// app.ts
import path from "path";
import express, { Request, Response, NextFunction } from "express";
import { connect } from "mongoose";
import createError, { HttpError } from "http-errors";
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
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");

// Setup request body parser.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup static assets.
app.use(express.static(path.join(__dirname, "..", "public")));

// Setup routers.
app.use(indexRouter);

// Setup error handler.
app.use((req, res, next) => {
  return next(createError(404));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // render the error page
  res.status(err.status || 500);
  return res.render("error", {
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

export default app;
