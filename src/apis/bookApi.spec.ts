// apis/bookApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";
import { indexApi, bookListApi, bookDetailApi } from "./bookApi";

describe("test book APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/", indexApi);
  app.get("/books", bookListApi);
  app.get("/book/:id", bookDetailApi);

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
      genre: [genre._id],
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

  test("GET /books", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const book = await Book.create({
      title: "The Test Title",
      author,
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    await Book.create({
      title: "Another Test Title",
      author,
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });
    const res = await request(app).get("/books");

    expect(res.status).toBe(200);
    expect(res.body.bookList.length).toBe(2);
    expect(res.body.bookList[1]._id).toBe(String(book._id));
    expect(res.body.bookList[1].author.firstName).toBe(author.firstName);
  });

  test("GET /book/:id", async () => {
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
      genre: [genre._id],
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
    });
    const res = await request(app).get(`/book/${book._id}`);

    expect(res.status).toBe(200);
    expect(res.body.book._id).toBe(String(book._id));
    expect(res.body.book.author.firstName).toBe(author.firstName);
    expect(res.body.book.genre.length).toBe(1);
    expect(res.body.book.genre[0].name).toBe(genre.name);
    expect(res.body.bookInstances.length).toBe(1);
    expect(res.body.bookInstances[0]._id).toBe(String(bookInstance._id));

    const res2 = await request(app).get(`/book/${new Types.ObjectId()}`);

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("Book not found");

    const res3 = await request(app).get("/book/foobar");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });
});
