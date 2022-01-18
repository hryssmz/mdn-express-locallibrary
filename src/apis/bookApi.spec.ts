// apis/bookApi.spec.ts
import express from "express";
import { connect, connection } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";
import { indexApi } from "./bookApi";

describe("test book APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/", indexApi);

  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Promise.all([
      Author.deleteMany(),
      Book.deleteMany(),
      BookInstance.deleteMany(),
      Genre.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      Author.deleteMany(),
      Book.deleteMany(),
      BookInstance.deleteMany(),
      Genre.deleteMany(),
    ]);
    await connection.close();
  });

  test("GET /", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "1234567890000",
      genre: [genre],
    });
    await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint 2",
      status: "Available",
    });
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.data).toStrictEqual({
      bookCount: 1,
      bookInstanceCount: 2,
      bookInstanceAvailableCount: 1,
      authorCount: 1,
      genreCount: 1,
    });
  });
});
