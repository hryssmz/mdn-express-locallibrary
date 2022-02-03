// env.ts
import dotenv from "dotenv";

dotenv.config();

// NODE_ENV
if (!process.env.NODE_ENV) {
  throw new Error("Environment variable NODE_ENV is not set!");
}
export const NODE_ENV = process.env.NODE_ENV;

// APP_HOST
export const APP_HOST = process.env.APP_HOST || "0.0.0.0";

// APP_PORT
if (!process.env.APP_PORT) {
  throw new Error("Environment variable APP_PORT not set!");
}
export const APP_PORT = Number(process.env.APP_PORT);

// DB_HOST
if (!process.env.DB_HOST) {
  throw new Error("Environment variable DB_HOST not set!");
}
export const DB_HOST = process.env.DB_HOST;

// DB_PORT
if (!process.env.DB_PORT) {
  throw new Error("Environment variable DB_PORT not set!");
}
export const DB_PORT = Number(process.env.DB_PORT);

// DB_NAME
if (!process.env.DB_NAME) {
  throw new Error("Environment variable DB_NAME not set!");
}
export const DB_NAME = process.env.DB_NAME;
