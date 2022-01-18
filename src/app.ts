// app.ts
import express from "express";
import indexRouter from "./routes";

const app = express();

// Setup routers.
app.use(indexRouter);

// Set up request body parser.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export default app;
