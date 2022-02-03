// env.ts
import dotenv from "dotenv";

dotenv.config();

// NODE_ENV
if (!process.env.NODE_ENV) {
  throw new Error("Environment variable NODE_ENV is not set!");
}
export const NODE_ENV = process.env.NODE_ENV;

// HOST
export const HOST = process.env.HOST || "0.0.0.0";

// PORT
export const PORT = Number(process.env.PORT || "3000");

// DB_ATLAS
export const DB_ATLAS = process.env.DB_ATLAS || "FALSE";

// DB_USER
if (process.env.DB_ATLAS === "TRUE" && !process.env.DB_USER) {
  throw new Error("Environment variable DB_USER not set!");
}
export const DB_USER = process.env.DB_USER || "";

// DB_PASS
if (process.env.DB_ATLAS === "TRUE" && !process.env.DB_PASS) {
  throw new Error("Environment variable DB_PASS not set!");
}
export const DB_PASS = process.env.DB_PASS || "";

// DB_HOST
if (!process.env.DB_HOST) {
  throw new Error("Environment variable DB_HOST not set!");
}
export const DB_HOST = process.env.DB_HOST;

// DB_PORT
export const DB_PORT = Number(process.env.DB_PORT || "27017");

// DB_NAME
if (!process.env.DB_NAME) {
  throw new Error("Environment variable DB_NAME not set!");
}
export const DB_NAME = process.env.DB_NAME;
