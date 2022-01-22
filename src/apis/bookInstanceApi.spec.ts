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

describe("test bookInstance APIs", () => {
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

  test("GET /book-instances/create", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });
    const res = await request(app).get("/book-instances/create");

    expect(res.status).toBe(200);
    expect(res.body.bookList.length).toBe(2);
    expect(res.body.bookList[1]._id).toBe(String(book._id));
    expect(res.body.statusChoices).toStrictEqual(statusChoices);
  });

  test("POST /book-instances/create", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });
    const res = await request(app)
      .post("/book-instances/create")
      .send({
        book: book._id,
        imprint: "     Foo Imprint     ",
        status: "Loaned",
        dueBack: new Date("2020-01-01"),
      });

    expect(res.status).toBe(302);

    const bookInstances = await BookInstance.find();

    expect(bookInstances.length).toBe(1);
    expect(bookInstances[0].imprint).toBe("Foo Imprint");
    expect(res.text).toBe(`Found. Redirecting to ${bookInstances[0].url}`);

    const res2 = await request(app).post("/book-instances/create");

    expect(res2.status).toBe(400);
    expect(res2.body.bookList.length).toBe(2);
    expect(res2.body.bookList[1]._id).toBe(String(book._id));
    expect(res2.body.statusChoices).toStrictEqual(statusChoices);
    expect(res2.body.bookInstance).toStrictEqual({
      book: "",
      imprint: "",
      status: "",
    });
    expect(Object.keys(res2.body.errors).length).toBe(2);
    expect(res2.body.errors.book).toStrictEqual({
      location: "body",
      msg: "Book must be specified",
      param: "book",
      value: "",
    });
    expect(res2.body.errors.imprint).toStrictEqual({
      location: "body",
      msg: "Imprint must be specified",
      param: "imprint",
      value: "",
    });

    const res3 = await request(app).post("/book-instances/create").send({
      book: book._id,
      imprint: "Bar Imprint",
      status: "FooBar",
      dueBack: "INVALID",
    });

    expect(res3.status).toBe(400);
    expect(res3.body.bookInstance).toStrictEqual({
      book: String(book._id),
      imprint: "Bar Imprint",
      status: "FooBar", // This is currently OK...
      dueBack: null,
    });
    expect(Object.keys(res3.body.errors).length).toBe(1);
    expect(res3.body.errors.dueBack).toStrictEqual({
      location: "body",
      msg: "Invalid date",
      param: "dueBack",
      value: "INVALID",
    });

    const res4 = await request(app)
      .post("/book-instances/create")
      .send({
        book: book._id,
        imprint: "Bar Imprint",
        status: "FooBar",
        dueBack: new Date("2020-01-01"),
      });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("ValidationError");

    await request(app).post("/book-instances/create").send({
      book: book._id,
      imprint: "Bar Imprint",
      status: "Available",
      dueBack: "",
    });
    const bookInstance2 = await BookInstance.findOne({
      imprint: "Bar Imprint",
    });

    expect(bookInstance2).toBeTruthy();
    expect(
      Date.now() - (bookInstance2 ? Number(bookInstance2.dueBack) : 0)
    ).toBeLessThan(50);

    const res5 = await request(app)
      .post("/book-instances/create")
      .send({
        _id: "foobar",
        book: book._id,
        imprint: "Baz Imprint",
        status: "Available",
        dueBack: new Date("2020-01-01"),
      });

    expect(res5.status).toBe(500);
    expect(res5.body.name).toBe("ValidationError");
  });

  test("GET /book-instance/:id/update", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "1234567890001",
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
    expect(res.body.bookInstance._id).toBe(String(bookInstance._id));
    expect(res.body.bookList.length).toBe(2);
    expect(res.body.bookList[1]._id).toBe(String(book._id));
    expect(res.body.statusChoices).toStrictEqual(statusChoices);

    const res2 = await request(app).get(
      `/book-instance/${new Types.ObjectId()}/update`
    );

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("BookInstance not found");

    const res3 = await request(app).get("/book-instance/foobar/update");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });

  test("POST /book-instance/:id/update", async () => {
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
    });
    const book2 = await Book.create({
      title: "Another Test Title",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "1234567890001",
    });
    const bookInstance = await BookInstance.create({
      book: book2._id,
      imprint: "Foo",
      status: "Available",
    });
    const res = await request(app)
      .post(`/book-instance/${bookInstance._id}/update`)
      .send({
        book: book._id,
        imprint: "     Foo Imprint     ",
        status: "Loaned",
        dueBack: new Date("2021-12-31"),
      });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${bookInstance.url}`);

    const bookInstances = await BookInstance.find();

    expect(bookInstances.length).toBe(1);
    expect(bookInstances[0]._id).toStrictEqual(bookInstance._id);
    expect(bookInstances[0].imprint).toBe("Foo Imprint");

    const res2 = await request(app).post(
      `/book-instance/${bookInstance._id}/update`
    );

    expect(res2.status).toBe(400);
    expect(res2.body.bookList.length).toBe(2);
    expect(res2.body.bookList[1]._id).toBe(String(book._id));
    expect(res2.body.statusChoices).toStrictEqual(statusChoices);
    expect(res2.body.bookInstance).toStrictEqual({
      book: "",
      imprint: "",
      status: "",
    });
    expect(Object.keys(res2.body.errors).length).toBe(2);
    expect(res2.body.errors.book).toStrictEqual({
      location: "body",
      msg: "Book must be specified",
      param: "book",
      value: "",
    });
    expect(res2.body.errors.imprint).toStrictEqual({
      location: "body",
      msg: "Imprint must be specified",
      param: "imprint",
      value: "",
    });

    const res3 = await request(app)
      .post(`/book-instance/${bookInstance._id}/update`)
      .send({
        book: book._id,
        imprint: "Bar Imprint",
        status: "FooBar",
        dueBack: "INVALID",
      });

    expect(res3.status).toBe(400);
    expect(res3.body.bookInstance).toStrictEqual({
      book: String(book._id),
      imprint: "Bar Imprint",
      status: "FooBar", // This is currently OK...
      dueBack: null,
    });
    expect(Object.keys(res3.body.errors).length).toBe(1);
    expect(res3.body.errors.dueBack).toStrictEqual({
      location: "body",
      msg: "Invalid date",
      param: "dueBack",
      value: "INVALID",
    });

    const res4 = await request(app)
      .post(`/book-instance/${bookInstance._id}/update`)
      .send({
        book: book._id,
        imprint: "Bar Imprint",
        status: "FooBar",
        dueBack: new Date("2020-01-01"),
      });

    expect(res4.status).toBe(302); // <- Bug?

    const bookInstances2 = await BookInstance.find();

    expect(bookInstances2[0].status).toBe("FooBar"); // <- Bug?

    const res5 = await request(app)
      .post(`/book-instance/${bookInstance._id}/update`)
      .send({
        book: book._id,
        imprint: "Bar Imprint",
        status: "Available",
        dueBack: "",
      });
    expect(res5.status).toBe(302);

    const bookInstance2 = await BookInstance.findOne({
      imprint: "Bar Imprint",
    });

    expect(bookInstance2).toBeTruthy();
    expect(bookInstance2 ? Number(bookInstance2.dueBack) : 0).toBe(
      Number(new Date("2020-01-01"))
    );

    const res6 = await request(app)
      .post(`/book-instance/${bookInstance._id}/update`)
      .send({
        _id: "foobar",
        book: book._id,
        imprint: "Baz Imprint",
        status: "Available",
        dueBack: new Date("2020-01-01"),
      });

    expect(res6.status).toBe(500);
    expect(res6.body.name).toBe("CastError");

    const res7 = await request(app)
      .post(`/book-instance/${new Types.ObjectId()}/update`)
      .send({
        book: book._id,
        imprint: "Bar Imprint",
        status: "Loaned",
        dueBack: new Date("2021-12-31"),
      });

    expect(res7.status).toBe(404);
    expect(res7.body).toBe("BookInstance not found");

    const res8 = await request(app)
      .post("/book-instance/foobar/update")
      .send({
        book: book._id,
        imprint: "Bar Imprint",
        status: "Loaned",
        dueBack: new Date("2021-12-31"),
      });

    expect(res8.status).toBe(500);
    expect(res8.body.name).toBe("CastError");
  });

  test("GET /book-instance/:id/delete", async () => {
    const bookInstance = await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
    });
    const res = await request(app).get(
      `/book-instance/${bookInstance._id}/delete`
    );

    expect(res.status).toBe(200);
    expect(res.body.bookInstance._id).toBe(String(bookInstance._id));

    const res2 = await request(app).get(
      `/book-instance/${new Types.ObjectId()}/delete`
    );

    expect(res2.status).toBe(302);
    expect(res2.text).toBe("Found. Redirecting to /catalog/book-instances");

    const res3 = await request(app).get(`/book-instance/foobar/delete`);

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });

  test("POST /book-instance/:id/delete", async () => {
    const bookInstance = await BookInstance.create({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
    });

    expect(await BookInstance.countDocuments()).toBe(1);

    const res = await request(app).post(`/book-instance/xxxx/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/book-instances");

    const res2 = await request(app)
      .post(`/book-instance/xxxx/delete`)
      .send({ bookInstanceId: new Types.ObjectId() });

    expect(res2.status).toBe(302);
    expect(res2.text).toBe("Found. Redirecting to /catalog/book-instances");

    const res3 = await request(app)
      .post(`/book-instance/xxxx/delete`)
      .send({ bookInstanceId: "foobar" });

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
    expect(await BookInstance.countDocuments()).toBe(1);

    const res4 = await request(app)
      .post(`/book-instance/xxxx/delete`)
      .send({ bookInstanceId: bookInstance._id });

    expect(res4.status).toBe(302);
    expect(res4.text).toBe("Found. Redirecting to /catalog/book-instances");
    expect(await BookInstance.countDocuments()).toBe(0);
  });
});
