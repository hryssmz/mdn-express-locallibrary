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

describe("test book APIs", () => {
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

  test("GET /books/create", async () => {
    const author = await Author.create({
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
    expect(res.body.authors.length).toBe(2);
    expect(res.body.authors[1]._id).toBe(String(author._id));
    expect(res.body.genres.length).toBe(1);
    expect(res.body.genres[0]._id).toBe(String(genre._id));
  });

  test("POST /books/create", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const res = await request(app).post("/books/create").send({
      title: "     The Test Title     ",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });

    expect(res.status).toBe(302);

    const books = await Book.find();

    expect(books.length).toBe(1);
    expect(books[0].title).toBe("The Test Title");
    expect(res.text).toBe(`Found. Redirecting to ${books[0].url}`);

    const res2 = await request(app).post("/books/create");

    expect(res2.status).toBe(400);
    expect(res2.body.authors.length).toBe(2);
    expect(res2.body.authors[1]._id).toBe(String(author._id));
    expect(res2.body.genres.length).toBe(1);
    expect(res2.body.genres[0]._id).toBe(String(genre._id));
    expect(res2.body.book).toStrictEqual({
      author: "",
      genre: [],
      isbn: "",
      summary: "",
      title: "",
    });
    expect(Object.keys(res2.body.errors).length).toBe(4);
    expect(res2.body.errors.title).toStrictEqual({
      location: "body",
      msg: "Title must not be empty.",
      param: "title",
      value: "",
    });
    expect(res2.body.errors.author).toStrictEqual({
      location: "body",
      msg: "Author must not be empty.",
      param: "author",
      value: "",
    });
    expect(res2.body.errors.summary).toStrictEqual({
      location: "body",
      msg: "Summary must not be empty.",
      param: "summary",
      value: "",
    });
    expect(res2.body.errors.isbn).toStrictEqual({
      location: "body",
      msg: "ISBN must not be empty",
      param: "isbn",
      value: "",
    });

    const res3 = await request(app).post("/books/create").send({
      title: "Another Test Title",
      author: author._id,
      summary: "Here's another short summary.",
      genre: genre._id,
    });

    expect(res3.status).toBe(400);
    expect(res3.body.book).toStrictEqual({
      author: String(author._id),
      genre: [String(genre._id)],
      isbn: "",
      summary: "Here&#x27;s another short summary.",
      title: "Another Test Title",
    });

    const res4 = await request(app).post("/books/create").send({
      _id: "foobar",
      title: "Another Test Title",
      author: author._id,
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("ValidationError");
  });

  test("GET /book/:id/update", async () => {
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
      title: "The Test Title",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "1234567890000",
      genre: [genre._id],
    });
    const res = await request(app).get(`/book/${book._id}/update`);

    expect(res.status).toBe(200);
    expect(res.body.book._id).toBe(String(book._id));
    expect(res.body.authors.length).toBe(2);
    expect(res.body.authors[1]._id).toBe(String(author._id));
    expect(res.body.genres.length).toBe(1);
    expect(res.body.genres[0]._id).toBe(String(genre._id));

    const res2 = await request(app).get(`/book/${new Types.ObjectId()}/update`);

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("Book not found");

    const res3 = await request(app).get("/book/foobar/update");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });

  test("POST /book/:id/update", async () => {
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
      title: "Foo",
      author: new Types.ObjectId(),
      summary: "Foo summary.",
      isbn: "0000000000000",
    });
    const res = await request(app)
      .post(`/book/${book._id}/update`)
      .send({
        title: "     The Test Title     ",
        author: author._id,
        summary: "Here's a short summary.",
        isbn: "1234567890000",
        genre: [genre._id],
      });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${book.url}`);

    const books = await Book.find();

    expect(books.length).toBe(1);
    expect(books[0].title).toStrictEqual("The Test Title");
    expect(books[0].author).toStrictEqual(author._id);
    expect(books[0].genre && books[0].genre.length).toBe(1);
    expect(books[0].genre && books[0].genre[0]).toStrictEqual(genre._id);

    const res2 = await request(app).post(`/book/${book._id}/update`);

    expect(res2.status).toBe(400);
    expect(res2.body.authors.length).toBe(2);
    expect(res2.body.authors[1]._id).toBe(String(author._id));
    expect(res2.body.genres.length).toBe(1);
    expect(res2.body.genres[0]._id).toBe(String(genre._id));
    expect(res2.body.book).toStrictEqual({
      author: "",
      genre: [],
      isbn: "",
      summary: "",
      title: "",
    });
    expect(Object.keys(res2.body.errors).length).toBe(4);
    expect(res2.body.errors.title).toStrictEqual({
      location: "body",
      msg: "Title must not be empty.",
      param: "title",
      value: "",
    });
    expect(res2.body.errors.author).toStrictEqual({
      location: "body",
      msg: "Author must not be empty.",
      param: "author",
      value: "",
    });
    expect(res2.body.errors.summary).toStrictEqual({
      location: "body",
      msg: "Summary must not be empty.",
      param: "summary",
      value: "",
    });
    expect(res2.body.errors.isbn).toStrictEqual({
      location: "body",
      msg: "ISBN must not be empty",
      param: "isbn",
      value: "",
    });

    const res3 = await request(app).post(`/book/${book._id}/update`).send({
      title: "Another Test Title",
      author: author._id,
      summary: "Here's another short summary.",
      genre: genre._id,
    });

    expect(res3.status).toBe(400);
    expect(res3.body.book).toStrictEqual({
      author: String(author._id),
      genre: [String(genre._id)],
      isbn: "",
      summary: "Here&#x27;s another short summary.",
      title: "Another Test Title",
    });

    const res4 = await request(app).post(`/book/${book._id}/update`).send({
      _id: "foobar",
      title: "Another Test Title",
      author: author._id,
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("CastError");

    const res5 = await request(app)
      .post(`/book/${new Types.ObjectId()}/update`)
      .send({
        title: "Another Test Title",
        author: author._id,
        summary: "Here's another short summary.",
        isbn: "1234567890001",
      });

    expect(res5.status).toBe(404);
    expect(res5.body).toBe("Book not found");

    const res6 = await request(app).post("/book/foobar/update").send({
      title: "Another Test Title",
      author: author._id,
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });

    expect(res6.status).toBe(500);
    expect(res6.body.name).toBe("CastError");
  });

  test("GET /book/:id/delete", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
    });
    const res = await request(app).get(`/book/${book._id}/delete`);

    expect(res.status).toBe(200);
    expect(res.body.book._id).toBe(String(book._id));
    expect(res.body.bookInstances.length).toBe(1);
    expect(res.body.bookInstances[0]._id).toBe(String(bookInstance._id));

    const res2 = await request(app).get(`/book/${new Types.ObjectId()}/delete`);

    expect(res2.status).toBe(302);
    expect(res2.text).toBe("Found. Redirecting to /catalog/books");

    const res3 = await request(app).get(`/book/foobar/delete`);

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });

  test("POST /book/:id/delete", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
      status: "Loaned",
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

    await BookInstance.deleteMany();
    const res2 = await request(app).post(`/book/xxxx/delete`);

    expect(res2.status).toBe(302);
    expect(res2.text).toBe("Found. Redirecting to /catalog/books");

    const res3 = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: new Types.ObjectId() });

    expect(res3.status).toBe(302);
    expect(res3.text).toBe("Found. Redirecting to /catalog/books");

    const res4 = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: "foobar" });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("CastError");
    expect(await Book.countDocuments()).toBe(1);

    const res5 = await request(app)
      .post(`/book/xxxx/delete`)
      .send({ bookId: book._id });

    expect(res5.status).toBe(302);
    expect(res5.text).toBe("Found. Redirecting to /catalog/books");
    expect(await Book.countDocuments()).toBe(0);
  });
});
