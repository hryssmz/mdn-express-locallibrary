// apis/bookInstanceApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Book from "../models/book";
import BookInstance, { statusChoices } from "../models/bookInstance";
import {
  bookInstanceListApi,
  bookInstanceDetailApi,
  bookInstanceCreateGetApi,
  bookInstanceCreateApi,
  bookInstanceUpdateGetApi,
  bookInstanceUpdateApi,
  bookInstanceDeleteGetApi,
  bookInstanceDeleteApi,
} from "./bookInstanceApi";

const app = express();

beforeAll(async () => {
  await connect(testMongoURL);
  app.use(express.json());
  app.get("/book-instances", bookInstanceListApi);
  app.get("/book-instance/:id", bookInstanceDetailApi);
  app.get("/book-instances/create", bookInstanceCreateGetApi);
  app.post("/book-instances/create", bookInstanceCreateApi);
  app.get("/book-instance/:id/update", bookInstanceUpdateGetApi);
  app.post("/book-instance/:id/update", bookInstanceUpdateApi);
  app.get("/book-instance/:id/delete", bookInstanceDeleteGetApi);
  app.post("/book-instance/:id/delete", bookInstanceDeleteApi);
});

beforeEach(async () => {
  await Promise.all([Book.deleteMany(), BookInstance.deleteMany()]);
});

afterAll(async () => {
  await Promise.all([Book.deleteMany(), BookInstance.deleteMany()]);
  await connection.close();
});

describe("bookInstanceListApi", () => {
  test("HTTP 200: return book copy list", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
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
});

describe("bookInstanceDetailApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/book-instance/badObjectId");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book copy not found");
  });

  test("HTTP 404: book copy not found", async () => {
    const res = await request(app).get(
      `/book-instance/${new Types.ObjectId()}`
    );

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book copy not found");
  });

  test("HTTP 200: return book copy", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
    });
    const res = await request(app).get(`/book-instance/${bookInstance._id}`);

    expect(res.status).toBe(200);
    expect(res.body.bookInstance._id).toBe(String(bookInstance._id));
    expect(res.body.bookInstance.book.title).toBe(book.title);
  });
});

describe("bookInstanceCreateGetApi", () => {
  test("HTTP 200: return books and status choices", async () => {
    await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const res = await request(app).get("/book-instances/create");

    expect(res.status).toBe(200);
    // Books are sorted by title.
    expect(res.body.bookList.map((book: Book) => book.title)).toStrictEqual([
      "Another Test Title",
      "The Test Title",
    ]);
    expect(res.body.statusChoices).toStrictEqual(statusChoices);
  });
});

describe("bookInstanceCreateApi", () => {
  test("HTTP 400: return choices, book copy, and validation errors", async () => {
    await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const res = await request(app).post("/book-instances/create");

    expect(res.status).toBe(400);
    // Books are sorted by title.
    expect(res.body.bookList.map((book: Book) => book.title)).toStrictEqual([
      "Another Test Title",
      "The Test Title",
    ]);
    expect(res.body.statusChoices).toStrictEqual(statusChoices);
    expect(res.body.bookInstance).toStrictEqual({
      book: "",
      imprint: "",
      status: "Maintenance",
    });
    expect(Object.keys(res.body.errors).length).toBe(2);
    expect(res.body.errors.book).toStrictEqual({
      location: "body",
      msg: "Book must be specified",
      param: "book",
      value: "",
    });
    expect(res.body.errors.imprint).toStrictEqual({
      location: "body",
      msg: "Imprint must be specified",
      param: "imprint",
      value: "",
    });
  });

  test("HTTP 302: create book copy and redirect to detail view", async () => {
    const res = await request(app).post("/book-instances/create").send({
      book: new Types.ObjectId(),
      imprint: "  Foo Imprint ",
    });

    expect(res.status).toBe(302);

    const bookInstances = await BookInstance.find();

    expect(bookInstances.length).toBe(1);
    expect(bookInstances[0].imprint).toBe("Foo Imprint");
    expect(res.text).toBe(`Found. Redirecting to ${bookInstances[0].url}`);
  });
});

describe("bookInstanceUpdateGetApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/book-instance/badObjectId/update");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book copy not found");
  });

  test("HTTP 404: book copy not found", async () => {
    const res = await request(app).get(
      `/book-instance/${new Types.ObjectId()}/update`
    );

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book copy not found");
  });

  test("HTTP 200: return books, status choices and book copy", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    const res = await request(app).get(
      `/book-instance/${bookInstance._id}/update`
    );

    expect(res.status).toBe(200);
    // Books are sorted by title.
    expect(res.body.bookList.map((book: Book) => book.title)).toStrictEqual([
      "Another Test Title",
      "The Test Title",
    ]);
    expect(res.body.statusChoices).toStrictEqual(statusChoices);
    expect(res.body.bookInstance._id).toBe(String(bookInstance._id));
  });
});

describe("bookInstanceUpdateApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app)
      .post("/book-instance/badObjectId/update")
      .send({ book: new Types.ObjectId(), imprint: "Bar Imprint" });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book copy not found");
  });

  test("HTTP 404: book copy not found", async () => {
    const res = await request(app)
      .post(`/book-instance/${new Types.ObjectId()}/update`)
      .send({ book: new Types.ObjectId(), imprint: "Bar Imprint" });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book copy not found");
  });

  test("HTTP 400: return choices, book copy, and validation errors", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    const res = await request(app).post(
      `/book-instance/${bookInstance._id}/update`
    );

    expect(res.status).toBe(400);
    // Books are sorted by title.
    expect(res.body.bookList.map((book: Book) => book.title)).toStrictEqual([
      "Another Test Title",
      "The Test Title",
    ]);
    expect(res.body.statusChoices).toStrictEqual(statusChoices);
    expect(res.body.bookInstance).toStrictEqual({
      book: "",
      imprint: "",
      status: "Maintenance",
    });
    expect(Object.keys(res.body.errors).length).toBe(2);
    expect(res.body.errors.book).toStrictEqual({
      location: "body",
      msg: "Book must be specified",
      param: "book",
      value: "",
    });
    expect(res.body.errors.imprint).toStrictEqual({
      location: "body",
      msg: "Imprint must be specified",
      param: "imprint",
      value: "",
    });
  });

  test("HTTP 302: update book copy and redirect to detail view", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    const bookInstance = await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    const res = await request(app)
      .post(`/book-instance/${bookInstance._id}/update`)
      .send({
        book: book._id,
        imprint: "  Bar Imprint ",
      });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${bookInstance.url}`);

    const bookInstances = await BookInstance.find();

    expect(bookInstances.length).toBe(1);
    expect(bookInstances[0]._id).toStrictEqual(bookInstance._id);
    expect(bookInstances[0].imprint).toBe("Bar Imprint");
  });
});

describe("bookInstanceDeleteGetApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app).get(`/book-instance/badObjectId/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/book-instances");
  });

  test("HTTP 302: redirect to list view if book copy not found", async () => {
    const res = await request(app).get(
      `/book-instance/${new Types.ObjectId()}/delete`
    );

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/book-instances");
  });

  test("HTTP 200: return book copy", async () => {
    const bookInstance = await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
    });
    const res = await request(app).get(
      `/book-instance/${bookInstance._id}/delete`
    );

    expect(res.status).toBe(200);
    expect(res.body.bookInstance._id).toBe(String(bookInstance._id));
  });
});

describe("bookInstanceDeleteApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app)
      .post(`/book-instance/xxxx/delete`)
      .send({ bookInstanceId: "badObjectId" });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/book-instances");
  });

  test("HTTP 302: redirect to list view if book copy not found", async () => {
    const res = await request(app)
      .post(`/book-instance/xxxx/delete`)
      .send({ bookInstanceId: new Types.ObjectId() });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/book-instances");
  });

  test("HTTP 302: delete book and redirect to list view", async () => {
    const bookInstance = await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
    });

    expect(await BookInstance.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/book-instance/xxxx/delete`)
      .send({ bookInstanceId: bookInstance._id });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/book-instances");
    expect(await BookInstance.countDocuments()).toBe(0);
  });
});
