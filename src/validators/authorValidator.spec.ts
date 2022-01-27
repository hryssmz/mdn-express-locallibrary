// validators/authorValidator.spec.ts
import express, { Request, Response } from "express";
import { validationResult } from "express-validator";
import request from "supertest";
import { authorValidator } from "./authorValidator";

const app = express();

beforeAll(async () => {
  app.use(express.json());
  app.post("/", async (req: Request, res: Response) => {
    await authorValidator.run(req);
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
  test("all fields will be sanitized", async () => {
    const res = await request(app)
      .post("/")
      .send({
        firstName: "  John ",
        familyName: "  Doe ",
        dateOfBirth: new Date("1970-01-01"),
        dateOfDeath: new Date("2020-12-31"),
      });

    expect(res.body.errors).toStrictEqual({});
    // Names will be trimmed and dates will be converted to strings.
    expect(res.body.body).toStrictEqual({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: new Date("1970-01-01").toISOString(),
      dateOfDeath: new Date("2020-12-31").toISOString(),
    });
  });

  test("dates are optional", async () => {
    const res = await request(app).post("/").send({
      firstName: "John",
      familyName: "Doe",
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      firstName: "John",
      familyName: "Doe",
    });
  });

  test("empty string date inputs will be ignored", async () => {
    const res = await request(app).post("/").send({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: "",
      dateOfDeath: "",
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      firstName: "John",
      familyName: "Doe",
    });
  });

  test("null date inputs will be ignored", async () => {
    const res = await request(app).post("/").send({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: null,
      dateOfDeath: null,
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      firstName: "John",
      familyName: "Doe",
    });
  });
});

describe("invalid requests", () => {
  test("names not specified", async () => {
    const res = await request(app).post("/");

    expect(res.body.errors).toStrictEqual({
      firstName: {
        msg: "First name must be specified",
        value: "",
      },
      familyName: {
        msg: "Family name must be specified",
        value: "",
      },
    });
    expect(res.body.body).toStrictEqual({
      familyName: "",
      firstName: "",
    });
  });

  test("names too long", async () => {
    const firstName = Array(200).join("a");
    const familyName = Array(200).join("b");
    const res = await request(app).post("/").send({ firstName, familyName });

    expect(res.body.errors).toStrictEqual({
      firstName: {
        msg: "First name must be at most 100 chars long",
        value: firstName,
      },
      familyName: {
        msg: "Family name must be at most 100 chars long",
        value: familyName,
      },
    });
    expect(res.body.body).toStrictEqual({ familyName, firstName });
  });

  test("names not alphanumeric", async () => {
    const res = await request(app).post("/").send({
      firstName: "John, Doe",
      familyName: "<script>doSomethingEvil();</script>",
    });

    expect(res.body.errors).toStrictEqual({
      firstName: {
        msg: "First name has non-alphanumeric characters",
        value: "John, Doe",
      },
      familyName: {
        msg: "Family name has non-alphanumeric characters",
        value: "&lt;script&gt;doSomethingEvil();&lt;&#x2F;script&gt;",
      },
    });
    expect(res.body.body).toStrictEqual({
      firstName: "John, Doe",
      familyName: "&lt;script&gt;doSomethingEvil();&lt;&#x2F;script&gt;",
    });
  });

  test("bad date inputs", async () => {
    const res = await request(app).post("/").send({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: "INVALID",
      dateOfDeath: 0,
    });

    expect(res.body.errors).toStrictEqual({
      dateOfBirth: {
        msg: "Invalid date of birth",
        value: "INVALID",
      },
      dateOfDeath: {
        msg: "Invalid date of death",
        value: "0",
      },
    });
    expect(res.body.body).toStrictEqual({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: "INVALID",
      dateOfDeath: "0",
    });
  });
});
