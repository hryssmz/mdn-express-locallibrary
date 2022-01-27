// validators/bookValidator.spec.ts
import express, { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import request from "supertest";
import { bookValidator } from "./bookValidator";

const app = express();

beforeAll(async () => {
  app.use(express.json());
  app.post("/", async (req: Request, res: Response) => {
    await bookValidator.run(req);
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
    const author = new Types.ObjectId();
    const genre = new Types.ObjectId();
    const res = await request(app)
      .post("/")
      .send({
        title: "  The Test Title ",
        author: author._id,
        summary: "  Here's a short summary. ",
        isbn: "  9781234567897 ",
        genre: [genre._id],
      });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      title: "The Test Title",
      author: String(author._id),
      summary: "Here&#x27;s a short summary.",
      isbn: "9781234567897",
      genre: [String(genre._id)],
    });
  });

  test("genre can be a single ObjectId", async () => {
    const author = new Types.ObjectId();
    const genre = new Types.ObjectId();
    const res = await request(app).post("/").send({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
      genre,
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      title: "The Test Title",
      author: String(author._id),
      summary: "Here&#x27;s a short summary.",
      isbn: "9781234567897",
      genre: [String(genre._id)],
    });
  });

  test("genre is optional", async () => {
    const author = new Types.ObjectId();
    const res = await request(app).post("/").send({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });

    expect(res.body.errors).toStrictEqual({});
    expect(res.body.body).toStrictEqual({
      title: "The Test Title",
      author: String(author._id),
      summary: "Here&#x27;s a short summary.",
      isbn: "9781234567897",
      genre: [],
    });
  });
});

describe("invalid requests", () => {
  test("title, author, summary, and isbn not specified", async () => {
    const res = await request(app).post("/");

    expect(res.body.errors).toStrictEqual({
      title: { msg: "Title must not be empty.", value: "" },
      author: { msg: "Author must not be empty.", value: "" },
      summary: { msg: "Summary must not be empty.", value: "" },
      isbn: { msg: "ISBN must not be empty.", value: "" },
    });
    expect(res.body.body).toStrictEqual({
      title: "",
      author: "",
      summary: "",
      isbn: "",
      genre: [],
    });
  });

  test("bad ObjectId provided", async () => {
    const res = await request(app)
      .post("/")
      .send({
        title: "The Test Title",
        author: "badObjectId1",
        summary: "Here's a short summary.",
        isbn: "9781234567897",
        genre: ["badObjectId2"],
      });

    expect(res.body.errors).toStrictEqual({
      author: {
        msg: "Please specify a valid Mongo ID.",
        value: "badObjectId1",
      },
      "genre[0]": {
        msg: "Please specify a valid Mongo ID.",
        value: "badObjectId2",
      },
    });
    expect(res.body.body).toStrictEqual({
      title: "The Test Title",
      author: "badObjectId1",
      summary: "Here&#x27;s a short summary.",
      isbn: "9781234567897",
      genre: ["badObjectId2"],
    });
  });

  test("bad ISBN-13 provided", async () => {
    const author = new Types.ObjectId();
    const res = await request(app).post("/").send({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9999999999999",
    });

    expect(res.body.errors).toStrictEqual({
      isbn: {
        msg: "Please specify a valid ISBN-13.",
        value: "9999999999999",
      },
    });
    expect(res.body.body).toStrictEqual({
      title: "The Test Title",
      author: String(author._id),
      summary: "Here&#x27;s a short summary.",
      isbn: "9999999999999",
      genre: [],
    });
  });
});
