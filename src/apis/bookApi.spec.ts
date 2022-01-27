// apis/bookApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";
import {
  indexApi,
  bookListApi,
  bookDetailApi,
  bookCreateGetApi,
  bookCreateApi,
  bookUpdateGetApi,
  bookUpdateApi,
  bookDeleteGetApi,
  bookDeleteApi,
} from "./bookApi";

const app = express();

beforeAll(async () => {
  await connect(testMongoURL);
  app.use(express.json());
  app.get("/", indexApi);
  app.get("/books", bookListApi);
  app.get("/book/:id", bookDetailApi);
  app.get("/books/create", bookCreateGetApi);
  app.post("/books/create", bookCreateApi);
  app.get("/book/:id/update", bookUpdateGetApi);
  app.post("/book/:id/update", bookUpdateApi);
  app.get("/book/:id/delete", bookDeleteGetApi);
  app.post("/book/:id/delete", bookDeleteApi);
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

describe("indexApi", () => {
  test("HTTP 200: return number of each record in the library", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
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
});

describe("bookListApi", () => {
  test("HTTP 200: return book list sorted by title", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Book.create({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Another Test Title",
      author: author._id,
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const res = await request(app).get("/books");

    expect(res.status).toBe(200);
    // Books are sorted by title.
    expect(res.body.bookList.map((book: Book) => book.title)).toStrictEqual([
      "Another Test Title",
      "The Test Title",
    ]);
    expect(res.body.bookList[0].author.firstName).toBe(author.firstName);
  });
});

describe("bookDetailApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/book/badObjectId");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book not found");
  });

  test("HTTP 404: book not found", async () => {
    const res = await request(app).get(`/book/${new Types.ObjectId()}`);

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book not found");
  });

  test("HTTP 200: return book and all its copies", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
      genre: [genre._id],
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
    });
    await BookInstance.create({
      book: new Types.ObjectId(),
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
  });
});

describe("bookCreateGetApi", () => {
  test("HTTP 200: return all available authors and genres", async () => {
    await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const res = await request(app).get("/books/create");

    expect(res.status).toBe(200);
    // Authors are sorted by family name.
    expect(
      res.body.authors.map((author: Author) => author.familyName)
    ).toStrictEqual(["Bush", "Doe"]);
    expect(res.body.genres.length).toBe(1);
    expect(res.body.genres[0]._id).toBe(String(genre._id));
  });
});

describe("bookCreateApi", () => {
  test("HTTP 400: return authors, genres, book data, and validation errors", async () => {
    await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const res = await request(app).post("/books/create");

    expect(res.status).toBe(400);
    // Authors are sorted by family name.
    expect(
      res.body.authors.map((author: Author) => author.familyName)
    ).toStrictEqual(["Bush", "Doe"]);
    expect(res.body.genres.length).toBe(1);
    expect(res.body.genres[0]._id).toBe(String(genre._id));
    expect(res.body.book).toStrictEqual({
      author: "",
      genre: [],
      isbn: "",
      summary: "",
      title: "",
    });
    expect(res.body.errors).toStrictEqual({
      title: {
        location: "body",
        msg: "Title must not be empty",
        param: "title",
        value: "",
      },
      author: {
        location: "body",
        msg: "Author must not be empty",
        param: "author",
        value: "",
      },
      summary: {
        location: "body",
        msg: "Summary must not be empty",
        param: "summary",
        value: "",
      },
      isbn: {
        location: "body",
        msg: "ISBN must not be empty",
        param: "isbn",
        value: "",
      },
    });
  });

  test("HTTP 302: create book and redirect to detail view", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const res = await request(app).post("/books/create").send({
      title: "  The Test Title ",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });

    expect(res.status).toBe(302);

    const books = await Book.find();

    expect(books.length).toBe(1);
    expect(books[0].title).toBe("The Test Title");
    expect(res.text).toBe(`Found. Redirecting to ${books[0].url}`);
  });
});

describe("bookUpdateGetApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/book/badObjectId/update");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book not found");
  });

  test("HTTP 404: book not found", async () => {
    const res = await request(app).get(`/book/${new Types.ObjectId()}/update`);

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book not found");
  });

  test("HTTP 200: return authors, genres, and book data", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "Some Title",
      author: author._id,
      summary: "A short summary.",
      isbn: "9781234567897",
    });
    const res = await request(app).get(`/book/${book._id}/update`);

    expect(res.status).toBe(200);
    // Authors are sorted by family name.
    expect(
      res.body.authors.map((author: Author) => author.familyName)
    ).toStrictEqual(["Bush", "Doe"]);
    expect(res.body.genres.length).toBe(1);
    expect(res.body.genres[0]._id).toBe(String(genre._id));
    expect(res.body.book._id).toBe(String(book._id));
  });
});

describe("bookUpdateApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).post("/book/badObjectId/update").send({
      title: "Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book not found");
  });

  test("HTTP 404: book not found", async () => {
    const res = await request(app)
      .post(`/book/${new Types.ObjectId()}/update`)
      .send({
        title: "Test Title",
        author: new Types.ObjectId(),
        summary: "Here's a short summary.",
        isbn: "9781234567897",
      });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Book not found");
  });

  test("HTTP 400: return authors, genres, book data, and validation errors", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "Some Title",
      author: author._id,
      summary: "A short summary.",
      isbn: "9781234567897",
    });
    const res = await request(app).post(`/book/${book._id}/update`);

    expect(res.status).toBe(400);
    // Authors are sorted by family name.
    expect(
      res.body.authors.map((author: Author) => author.familyName)
    ).toStrictEqual(["Bush", "Doe"]);
    expect(res.body.genres.length).toBe(1);
    expect(res.body.genres[0]._id).toBe(String(genre._id));
    expect(res.body.book).toStrictEqual({
      author: "",
      genre: [],
      isbn: "",
      summary: "",
      title: "",
    });
    expect(res.body.errors).toStrictEqual({
      title: {
        location: "body",
        msg: "Title must not be empty",
        param: "title",
        value: "",
      },
      author: {
        location: "body",
        msg: "Author must not be empty",
        param: "author",
        value: "",
      },
      summary: {
        location: "body",
        msg: "Summary must not be empty",
        param: "summary",
        value: "",
      },
      isbn: {
        location: "body",
        msg: "ISBN must not be empty",
        param: "isbn",
        value: "",
      },
    });
  });

  test("HTTP 302: update book and redirect to detail view", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const book = await Book.create({
      title: "Some Title",
      author: new Types.ObjectId(),
      summary: "A short summary.",
      isbn: "9781234567897",
    });
    const res = await request(app).post(`/book/${book._id}/update`).send({
      title: "  Another Test Title ",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567903",
      genre: [],
    });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${book.url}`);
  });
});

describe("bookDeleteGetApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app).get(`/book/badObjectId/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/books");
  });

  test("HTTP 302: redirect to list view if book not found", async () => {
    const res = await request(app).get(`/book/${new Types.ObjectId()}/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/books");
  });

  test("HTTP 200: return book and all its copies", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Bar Imprint",
    });
    const res = await request(app).get(`/book/${book._id}/delete`);

    expect(res.status).toBe(200);
    expect(res.body.book._id).toBe(String(book._id));
    expect(res.body.bookInstances.length).toBe(1);
    expect(res.body.bookInstances[0]._id).toBe(String(bookInstance._id));
  });
});

describe("bookDeleteApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: "badObjectId" });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/books");
  });

  test("HTTP 302: redirect to list view if book not found", async () => {
    const res = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: new Types.ObjectId() });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/books");
  });

  test("HTTP 200: return book and all its copies without deleting", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Bar Imprint",
    });

    expect(await Book.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: book._id });

    expect(res.status).toBe(200);
    expect(res.body.book._id).toBe(String(book._id));
    expect(res.body.bookInstances.length).toBe(1);
    expect(res.body.bookInstances[0]._id).toBe(String(bookInstance._id));
    expect(await Book.countDocuments()).toBe(1);
  });

  test("HTTP 302: delete book and redirect to list view", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });

    expect(await Book.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: book._id });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/books");
    expect(await Book.countDocuments()).toBe(0);
  });
});
