// apis/bookInstanceApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import { bookInstanceListApi, bookInstanceDetailApi } from "./bookInstanceApi";

describe("test bookInstance APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/book-instances", bookInstanceListApi);
  app.get("/book-instance/:id", bookInstanceDetailApi);

  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Promise.all([Book.deleteMany(), BookInstance.deleteMany()]);
  });

  afterAll(async () => {
    await Promise.all([Book.deleteMany(), BookInstance.deleteMany()]);
    await connection.close();
  });

  test("GET /book-instances", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
    });
    const res = await request(app).get("/book-instances");

    expect(res.status).toBe(200);
    expect(res.body.bookInstanceList.length).toBe(1);
    expect(res.body.bookInstanceList[0]._id).toBe(String(bookInstance._id));
    expect(res.body.bookInstanceList[0].book.title).toBe(book.title);
  });

  test("GET /book-instance/:id", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
    });
    const res = await request(app).get(`/book-instance/${bookInstance._id}`);

    expect(res.status).toBe(200);
    expect(res.body.bookInstance._id).toBe(String(bookInstance._id));
    expect(res.body.bookInstance.book.title).toBe(book.title);

    const res2 = await request(app).get(
      `/book-instance/${new Types.ObjectId()}`
    );

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("Book copy not found");

    const res3 = await request(app).get("/book-instance/foobar");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });
});
