// apis/authorApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Author from "../models/author";
import Book from "../models/book";
import { authorListApi, authorDetailApi } from "./authorApi";

describe("test author APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/authors", authorListApi);
  app.get("/author/:id", authorDetailApi);

  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Promise.all([Author.deleteMany(), Book.deleteMany()]);
  });

  afterAll(async () => {
    await Promise.all([Author.deleteMany(), Book.deleteMany()]);
    await connection.close();
  });

  test("GET /authors", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const res = await request(app).get("/authors");

    expect(res.status).toBe(200);
    expect(res.body.authorList.length).toBe(2);
    expect(res.body.authorList[1]._id).toBe(String(author._id));
  });

  test("GET /author/:id", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const book = await Book.create({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    const res = await request(app).get(`/author/${author._id}`);

    expect(res.status).toBe(200);
    expect(res.body.author._id).toBe(String(author._id));
    expect(res.body.authorsBooks.length).toBe(1);
    expect(res.body.authorsBooks[0]._id).toBe(String(book._id));

    const res2 = await request(app).get(`/author/${new Types.ObjectId()}`);

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("Author not found");

    const res3 = await request(app).get("/author/foobar");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });
});
