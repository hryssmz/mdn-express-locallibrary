// validators/genreValidator.spec.ts
import express, { Request, Response } from "express";
import { validationResult } from "express-validator";
import request from "supertest";
import { genreValidator } from "./genreValidator";

const app = express();

beforeAll(async () => {
  app.use(express.json());
  app.post("/", async (req: Request, res: Response) => {
    await genreValidator.run(req);
    const customValidationResult = validationResult.withDefaults({
      formatter: ({ msg, value }) => ({ msg, value }),
    });
    return res.json({
      errors: customValidationResult(req).mapped(),
      body: req.body,
    });
  });
});

describe("valid requests", () => {
  test("all fields with be sanitized", async () => {
    const res = await request(app).post("/").send({ name: "  Fantasy " });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({ name: "Fantasy" });
  });
});

describe("invalid requests", () => {
  test("name not specified", async () => {
    const res = await request(app).post("/");

    expect(res.body.errors).toStrictEqual({
      name: { msg: "Genre name required", value: "" },
    });
    expect(res.body.body).toStrictEqual({ name: "" });
  });

  test("name too short", async () => {
    const res = await request(app).post("/").send({ name: "a" });

    expect(res.body.errors).toStrictEqual({
      name: {
        msg: "Genre name must between 3 chars and 100 chars long",
        value: "a",
      },
    });
    expect(res.body.body).toStrictEqual({ name: "a" });
  });

  test("name too long", async () => {
    const name = Array(200).join("a");
    const res = await request(app).post("/").send({ name });

    expect(res.body.errors).toStrictEqual({
      name: {
        msg: "Genre name must between 3 chars and 100 chars long",
        value: name,
      },
    });
    expect(res.body.body).toStrictEqual({ name });
  });
});
