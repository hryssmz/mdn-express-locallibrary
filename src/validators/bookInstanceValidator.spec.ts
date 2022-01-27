// validators/bookInstanceValidator.spec.ts
import express, { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import request from "supertest";
import { bookInstanceValidator } from "./bookInstanceValidator";

const app = express();

beforeAll(async () => {
  app.use(express.json());
  app.post("/", async (req: Request, res: Response) => {
    await bookInstanceValidator.run(req);
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
    const book = new Types.ObjectId();
    const res = await request(app)
      .post("/")
      .send({
        book: book._id,
        imprint: "  Foo Imprint ",
        status: "  Loaned ",
        dueBack: new Date("2020-12-31"),
      });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      book: String(book._id),
      imprint: "Foo Imprint",
      status: "Loaned",
      dueBack: new Date("2020-12-31").toISOString(),
    });
  });

  test("status and dueBack are optional", async () => {
    const book = new Types.ObjectId();
    const res = await request(app).post("/").send({
      book: book._id,
      imprint: "Foo Imprint",
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      book: String(book._id),
      imprint: "Foo Imprint",
      status: "Maintenance",
    });
  });

  test("empty string date input will be ignored", async () => {
    const book = new Types.ObjectId();
    const res = await request(app).post("/").send({
      book: book._id,
      imprint: "Foo Imprint",
      dueBack: "",
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      book: String(book._id),
      imprint: "Foo Imprint",
      status: "Maintenance",
    });
  });

  test("null date input will be ignored", async () => {
    const book = new Types.ObjectId();
    const res = await request(app).post("/").send({
      book: book._id,
      imprint: "Foo Imprint",
      dueBack: null,
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      book: String(book._id),
      imprint: "Foo Imprint",
      status: "Maintenance",
    });
  });
});

describe("invalid requests", () => {
  test("book and imprint not specified", async () => {
    const res = await request(app).post("/");

    expect(res.body.errors).toStrictEqual({
      book: {
        msg: "Book must be specified",
        value: "",
      },
      imprint: {
        msg: "Imprint must be specified",
        value: "",
      },
    });
    expect(res.body.body).toStrictEqual({
      book: "",
      imprint: "",
      status: "Maintenance",
    });
  });

  test("invalid book ID, status, date specified", async () => {
    const res = await request(app).post("/").send({
      book: "badObjectId",
      imprint: "Foo Imprint",
      status: "BadStatus",
      dueBack: "INVALID",
    });

    expect(res.body.errors).toStrictEqual({
      book: {
        msg: "Please specify a valid Mongo ID",
        value: "badObjectId",
      },
      status: {
        msg: "Status 'BadStatus' is not allowed",
        value: "BadStatus",
      },
      dueBack: {
        msg: "Invalid date",
        value: "INVALID",
      },
    });
    expect(res.body.body).toStrictEqual({
      book: "badObjectId",
      imprint: "Foo Imprint",
      status: "BadStatus",
      dueBack: "INVALID",
    });
  });
});
