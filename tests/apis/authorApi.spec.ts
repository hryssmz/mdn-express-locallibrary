// apis/authorApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../../src/utils";
import Author from "../../src/models/author";
import Book from "../../src/models/book";
import {
  authorListApi,
  authorDetailApi,
  authorCreateApi,
  authorUpdateGetApi,
  authorUpdateApi,
  authorDeleteGetApi,
  authorDeleteApi,
} from "../../src/apis/authorApi";

const app = express();

beforeAll(async () => {
  await connect(testMongoURL);
  app.use(express.json());
  app.get("/authors", authorListApi);
  app.get("/author/:id", authorDetailApi);
  app.post("/authors/create", authorCreateApi);
  app.get("/author/:id/update", authorUpdateGetApi);
  app.post("/author/:id/update", authorUpdateApi);
  app.get("/author/:id/delete", authorDeleteGetApi);
  app.post("/author/:id/delete", authorDeleteApi);
});

beforeEach(async () => {
  await Promise.all([Author.deleteMany(), Book.deleteMany()]);
});

afterAll(async () => {
  await Promise.all([Author.deleteMany(), Book.deleteMany()]);
  await connection.close();
});

describe("authorListApi", () => {
  test("HTTP 200: return author list sorted by family name", async () => {
    await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    await Author.create({
      firstName: "Lily",
      familyName: "Bush",
    });
    const res = await request(app).get("/authors");

    expect(res.status).toBe(200);
    expect(
      res.body.authorList.map((author: Author) => author.familyName)
    ).toStrictEqual(["Bush", "Doe"]);
  });
});

describe("authorDetailApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/author/badObjectId");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Author not found");
  });

  test("HTTP 404: author not found", async () => {
    const res = await request(app).get(`/author/${new Types.ObjectId()}`);

    expect(res.status).toBe(404);
    expect(res.body).toBe("Author not found");
  });

  test("HTTP 200: return author and all her/his books", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const book = await Book.create({
      title: "John Doe's Book",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Somebody Else's Book",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const res = await request(app).get(`/author/${author._id}`);

    expect(res.status).toBe(200);
    expect(res.body.author._id).toBe(String(author._id));
    expect(res.body.authorsBooks.length).toBe(1);
    expect(res.body.authorsBooks[0]._id).toBe(String(book._id));
  });
});

describe("authorCreateApi", () => {
  test("HTTP 400: return author data and validation errors", async () => {
    const res = await request(app).post("/authors/create");

    expect(res.status).toBe(400);
    expect(res.body.author).toStrictEqual({
      firstName: "",
      familyName: "",
    });
    expect(res.body.errors).toStrictEqual({
      firstName: {
        location: "body",
        msg: "First name must be specified",
        param: "firstName",
        value: "",
      },
      familyName: {
        location: "body",
        msg: "Family name must be specified",
        param: "familyName",
        value: "",
      },
    });
  });

  test("HTTP 302: create author and redirect to detail view", async () => {
    const res = await request(app)
      .post("/authors/create")
      .send({
        firstName: "  John ",
        familyName: "Doe",
        dateOfBirth: new Date("1970-01-01"),
      });

    expect(res.status).toBe(302);

    const authors = await Author.find();

    expect(authors.length).toBe(1);
    expect(authors[0].name).toBe("John, Doe");
    expect(authors[0].lifespan).toBe("Jan 1, 1970 - ");
    expect(res.text).toBe(`Found. Redirecting to ${authors[0].url}`);
  });
});

describe("authorUpdateGetApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/author/badObjectId/update");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Author not found");
  });

  test("HTTP 404: author not found", async () => {
    const res = await request(app).get(
      `/author/${new Types.ObjectId()}/update`
    );

    expect(res.status).toBe(404);
    expect(res.body).toBe("Author not found");
  });

  test("HTTP 200: return author", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const res = await request(app).get(`/author/${author._id}/update`);

    expect(res.status).toBe(200);
    expect(res.body.author._id).toBe(String(author._id));
  });
});

describe("authorUpdateApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).post("/author/badObjectId/update").send({
      firstName: "John",
      familyName: "Doe",
    });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Author not found");
  });

  test("HTTP 404: author not found", async () => {
    const res = await request(app)
      .post(`/author/${new Types.ObjectId()}/update`)
      .send({
        firstName: "John",
        familyName: "Doe",
      });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Author not found");
  });

  test("HTTP 400: return author data and validation errors", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const res = await request(app).post(`/author/${author._id}/update`);

    expect(res.status).toBe(400);
    expect(res.body.author).toStrictEqual({
      firstName: "",
      familyName: "",
    });
    expect(res.body.errors).toStrictEqual({
      firstName: {
        location: "body",
        msg: "First name must be specified",
        param: "firstName",
        value: "",
      },
      familyName: {
        location: "body",
        msg: "Family name must be specified",
        param: "familyName",
        value: "",
      },
    });
  });

  test("HTTP 302: update author and redirect to detail view", async () => {
    const author = await Author.create({ firstName: "Foo", familyName: "Bar" });

    const res = await request(app)
      .post(`/author/${author._id}/update`)
      .send({
        firstName: "  John ",
        familyName: "Doe",
        dateOfBirth: new Date("1970-01-01"),
      });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${author.url}`);

    const authors = await Author.find();

    expect(authors.length).toBe(1);
    expect(authors[0].name).toBe("John, Doe");
    expect(authors[0].lifespan).toBe("Jan 1, 1970 - ");
  });
});

describe("authorDeleteGetApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app).get(`/author/badObjectId/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/authors");
  });

  test("HTTP 302: redirect to list view if author not found", async () => {
    const res = await request(app).get(
      `/author/${new Types.ObjectId()}/delete`
    );

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/authors");
  });

  test("HTTP 200: return author and all her/his books", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const book = await Book.create({
      title: "John Doe's Book",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Somebody Else's Book",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });
    const res = await request(app).get(`/author/${author._id}/delete`);

    expect(res.status).toBe(200);
    expect(res.body.author._id).toBe(String(author._id));
    expect(res.body.authorsBooks.length).toBe(1);
    expect(res.body.authorsBooks[0]._id).toBe(String(book._id));
  });
});

describe("authorDeleteApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app)
      .post(`/author/xxxx/delete`)
      .send({ authorId: "badObjectId" });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/authors");
  });

  test("HTTP 302: redirect to list view if author not found", async () => {
    const res = await request(app)
      .post(`/author/xxxx/delete`)
      .send({ authorId: new Types.ObjectId() });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/authors");
  });

  test("HTTP 200: return author and all her/his books without deleting", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const book = await Book.create({
      title: "John Doe's Book",
      author: author._id,
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    await Book.create({
      title: "Somebody Else's Book",
      author: new Types.ObjectId(),
      summary: "Here's another short summary.",
      isbn: "9781234567903",
    });

    expect(await Author.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/author/xxxx/delete`)
      .send({ authorId: author._id });

    expect(res.status).toBe(200);
    expect(res.body.author._id).toBe(String(author._id));
    expect(res.body.authorsBooks.length).toBe(1);
    expect(res.body.authorsBooks[0]._id).toBe(String(book._id));
    expect(await Author.countDocuments()).toBe(1);
  });

  test("HTTP 302: delete author and redirect to list view", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });

    expect(await Author.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/author/xxxx/delete`)
      .send({ authorId: author._id });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/authors");
    expect(await Author.countDocuments()).toBe(0);
  });
});
