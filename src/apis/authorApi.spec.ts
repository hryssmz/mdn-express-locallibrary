// apis/authorApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Author from "../models/author";
import Book from "../models/book";
import {
  authorListApi,
  authorDetailApi,
  authorCreateApi,
  authorUpdateGetApi,
  authorUpdateApi,
} from "./authorApi";

describe("test author APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/authors", authorListApi);
  app.get("/author/:id", authorDetailApi);
  app.post("/authors/create", authorCreateApi);
  app.get("/author/:id/update", authorUpdateGetApi);
  app.post("/author/:id/update", authorUpdateApi);

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

  test("POST /authors/create", async () => {
    const res = await request(app)
      .post("/authors/create")
      .send({
        firstName: "     John     ",
        familyName: "Doe",
        dateOfBirth: new Date("1970-01-01"),
        dateOfDeath: new Date("2021-12-31"),
      });

    expect(res.status).toBe(302);

    const authors = await Author.find();

    expect(authors.length).toBe(1);
    expect(authors[0].name).toBe("John, Doe");
    expect(authors[0].lifespan).toBe("Jan 1, 1970 - Dec 31, 2021");
    expect(res.text).toBe(`Found. Redirecting to ${authors[0].url}`);

    const res2 = await request(app).post("/authors/create");

    expect(res2.status).toBe(400);
    expect(res2.body.author).toStrictEqual({
      firstName: "",
      familyName: "",
    });
    expect(res2.body.errors.length).toBe(4);
    expect(res2.body.errors[0]).toStrictEqual({
      location: "body",
      msg: "First name must be specified.",
      param: "firstName",
      value: "",
    });
    expect(res2.body.errors[1]).toStrictEqual({
      location: "body",
      msg: "First name has non-alphanumeric characters.",
      param: "firstName",
      value: "",
    });
    expect(res2.body.errors[2]).toStrictEqual({
      location: "body",
      msg: "Family name must be specified.",
      param: "familyName",
      value: "",
    });
    expect(res2.body.errors[3]).toStrictEqual({
      location: "body",
      msg: "Family name has non-alphanumeric characters.",
      param: "familyName",
      value: "",
    });

    const res3 = await request(app).post("/authors/create").send({
      firstName: "Invalid firstName.",
      familyName: "Doe",
      dateOfBirth: "INVALID",
    });

    expect(res3.status).toBe(400);
    expect(res3.body.author).toStrictEqual({
      firstName: "Invalid firstName.",
      familyName: "Doe",
      dateOfBirth: null,
    });
    expect(res3.body.errors.length).toBe(2);
    expect(res3.body.errors[0]).toStrictEqual({
      location: "body",
      msg: "First name has non-alphanumeric characters.",
      param: "firstName",
      value: "Invalid firstName.",
    });
    expect(res3.body.errors[1]).toStrictEqual({
      location: "body",
      msg: "Invalid date of birth",
      param: "dateOfBirth",
      value: "INVALID",
    });

    const res4 = await request(app).post("/authors/create").send({
      _id: "foobar",
      firstName: "John",
      familyName: "Doe",
    });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("ValidationError");
  });

  test("GET /author/:id/update", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const res = await request(app).get(`/author/${author._id}/update`);

    expect(res.status).toBe(200);
    expect(res.body.author._id).toBe(String(author._id));

    const res2 = await request(app).get(
      `/author/${new Types.ObjectId()}/update`
    );

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("Author not found");

    const res3 = await request(app).get("/author/foobar/update");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });

  test("POST /author/:id/update", async () => {
    const author = await Author.create({
      firstName: "Foo",
      familyName: "Bar",
    });

    const res = await request(app)
      .post(`/author/${author._id}/update`)
      .send({
        firstName: "     John     ",
        familyName: "Doe",
        dateOfBirth: new Date("1970-01-01"),
      });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${author.url}`);

    const authors = await Author.find();

    expect(authors.length).toBe(1);
    expect(authors[0].name).toBe("John, Doe");
    expect(authors[0].lifespan).toBe("Jan 1, 1970 - ");

    const res2 = await request(app).post(`/author/${author._id}/update`);

    expect(res2.status).toBe(400);
    expect(res2.body.author).toStrictEqual({
      firstName: "",
      familyName: "",
    });
    expect(res2.body.errors.length).toBe(4);
    expect(res2.body.errors[0]).toStrictEqual({
      location: "body",
      msg: "First name must be specified.",
      param: "firstName",
      value: "",
    });
    expect(res2.body.errors[1]).toStrictEqual({
      location: "body",
      msg: "First name has non-alphanumeric characters.",
      param: "firstName",
      value: "",
    });
    expect(res2.body.errors[2]).toStrictEqual({
      location: "body",
      msg: "Family name must be specified.",
      param: "familyName",
      value: "",
    });
    expect(res2.body.errors[3]).toStrictEqual({
      location: "body",
      msg: "Family name has non-alphanumeric characters.",
      param: "familyName",
      value: "",
    });

    const res3 = await request(app).post(`/author/${author._id}/update`).send({
      firstName: "Invalid firstName.",
      familyName: "Doe",
      dateOfBirth: "INVALID",
    });

    expect(res3.status).toBe(400);
    expect(res3.body.author).toStrictEqual({
      firstName: "Invalid firstName.",
      familyName: "Doe",
      dateOfBirth: null,
    });
    expect(res3.body.errors.length).toBe(2);
    expect(res3.body.errors[0]).toStrictEqual({
      location: "body",
      msg: "First name has non-alphanumeric characters.",
      param: "firstName",
      value: "Invalid firstName.",
    });
    expect(res3.body.errors[1]).toStrictEqual({
      location: "body",
      msg: "Invalid date of birth",
      param: "dateOfBirth",
      value: "INVALID",
    });

    const res4 = await request(app).post(`/author/${author._id}/update`).send({
      _id: "foobar",
      firstName: "John",
      familyName: "Doe",
    });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("CastError");

    const res5 = await request(app)
      .post(`/author/${new Types.ObjectId()}/update`)
      .send({
        firstName: "Lily",
        familyName: "Bush",
        dateOfDeath: new Date("1970-01-01"),
      });

    expect(res5.status).toBe(404);
    expect(res5.body).toBe("Author not found");

    const res6 = await request(app)
      .post("/author/foobar/update")
      .send({
        firstName: "Lily",
        familyName: "Bush",
        dateOfDeath: new Date("1970-01-01"),
      });

    expect(res6.status).toBe(500);
    expect(res6.body.name).toBe("CastError");
  });
});
