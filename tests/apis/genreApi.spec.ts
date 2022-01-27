// apis/genreApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../../src/utils";
import Book from "../../src/models/book";
import Genre from "../../src/models/genre";
import {
  genreListApi,
  genreDetailApi,
  genreCreateApi,
  genreUpdateGetApi,
  genreUpdateApi,
  genreDeleteGetApi,
  genreDeleteApi,
} from "../../src/apis/genreApi";

const app = express();

beforeAll(async () => {
  await connect(testMongoURL);
  app.use(express.json());
  app.get("/genres", genreListApi);
  app.get("/genre/:id", genreDetailApi);
  app.post("/genres/create", genreCreateApi);
  app.get("/genre/:id/update", genreUpdateGetApi);
  app.post("/genre/:id/update", genreUpdateApi);
  app.get("/genre/:id/delete", genreDeleteGetApi);
  app.post("/genre/:id/delete", genreDeleteApi);
});

beforeEach(async () => {
  await Genre.deleteMany();
});

afterAll(async () => {
  await Genre.deleteMany();
  await connection.close();
});

describe("genreListApi", () => {
  test("HTTP 200: return genre list sorted by name", async () => {
    await Genre.create({ name: "Fantasy" });
    await Genre.create({ name: "Essay" });
    const res = await request(app).get("/genres");

    expect(res.status).toBe(200);
    expect(res.body.genreList.map((genre: Genre) => genre.name)).toStrictEqual([
      "Essay",
      "Fantasy",
    ]);
  });
});

describe("genreDetailApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/genre/badObjectId");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Genre not found");
  });

  test("HTTP 404: genre not found", async () => {
    const res = await request(app).get(`/genre/${new Types.ObjectId()}`);

    expect(res.status).toBe(404);
    expect(res.body).toBe("Genre not found");
  });

  test("HTTP 200: return genre and all related books", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "Fantasy Book",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
      genre: [genre._id],
    });
    await Book.create({
      title: "No Genre Book",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    const res = await request(app).get(`/genre/${genre._id}`);

    expect(res.status).toBe(200);
    expect(res.body.genre._id).toBe(String(genre._id));
    expect(res.body.genreBooks.length).toBe(1);
    expect(res.body.genreBooks[0]._id).toBe(String(book._id));
  });
});

describe("genreCreateApi", () => {
  test("HTTP 400: return genre data and validation errors", async () => {
    const res = await request(app).post("/genres/create");

    expect(res.status).toBe(400);
    expect(res.body.genre).toStrictEqual({ name: "" });
    expect(res.body.errors).toStrictEqual({
      name: {
        location: "body",
        msg: "Genre name required",
        param: "name",
        value: "",
      },
    });
  });

  test("HTTP 302: redirect to its detail page if Genre name exists", async () => {
    const genre = await Genre.create({ name: "Fantasy" });

    expect(await Genre.countDocuments()).toBe(1);

    const res = await request(app)
      .post("/genres/create")
      .send({ name: "Fantasy" });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${genre.url}`);
    expect(await Genre.countDocuments()).toBe(1);
  });

  test("HTTP 302: create genre and redirect to detail view", async () => {
    const res = await request(app)
      .post("/genres/create")
      .send({ name: "Fantasy" });

    expect(res.status).toBe(302);

    const genres = await Genre.find({ name: "Fantasy" });

    expect(genres.length).toBe(1);
    expect(res.text).toBe(`Found. Redirecting to ${genres[0].url}`);
  });
});

describe("genreUpdateGetApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app).get("/genre/badObjectId/update");

    expect(res.status).toBe(404);
    expect(res.body).toBe("Genre not found");
  });

  test("HTTP 404: genre not found", async () => {
    const res = await request(app).get(`/genre/${new Types.ObjectId()}/update`);

    expect(res.status).toBe(404);
    expect(res.body).toBe("Genre not found");
  });

  test("HTTP 200: return genre data", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const res = await request(app).get(`/genre/${genre._id}/update`);

    expect(res.status).toBe(200);
    expect(res.body.genre._id).toBe(String(genre._id));
  });
});

describe("genreUpdateApi", () => {
  test("HTTP 404: bad ID provided", async () => {
    const res = await request(app)
      .post("/genre/badObjectId/update")
      .send({ name: "Fantasy" });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Genre not found");
  });

  test("HTTP 404: genre not found", async () => {
    const res = await request(app)
      .post(`/genre/${new Types.ObjectId()}/update`)
      .send({ name: "Fantasy" });

    expect(res.status).toBe(404);
    expect(res.body).toBe("Genre not found");
  });

  test("HTTP 400: return genre data and validation errors", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const res = await request(app).post(`/genre/${genre._id}/update`);

    expect(res.status).toBe(400);
    expect(res.body.genre).toStrictEqual({ name: "" });
    expect(res.body.errors).toStrictEqual({
      name: {
        location: "body",
        msg: "Genre name required",
        param: "name",
        value: "",
      },
    });
  });

  test("HTTP 302: update genre and redirect to detail view", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const res = await request(app)
      .post(`/genre/${genre._id}/update`)
      .send({ name: "  History " });

    expect(res.status).toBe(302);
    expect(res.text).toBe(`Found. Redirecting to ${genre.url}`);

    const genres = await Genre.find();

    expect(genres.length).toBe(1);
    expect(genres[0].name).toBe("History");
  });
});

describe("genreDeleteGetApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app).get(`/genre/badObjectId/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/genres");
  });

  test("HTTP 302: redirect to list view if genre not found", async () => {
    const res = await request(app).get(`/genre/${new Types.ObjectId()}/delete`);

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/genres");
  });

  test("HTTP 200: return genre and all related books", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "Fantasy Book",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
      genre: [genre._id],
    });
    await Book.create({
      title: "No Genre Book",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });
    const res = await request(app).get(`/genre/${genre._id}/delete`);

    expect(res.status).toBe(200);
    expect(res.body.genre._id).toBe(String(genre._id));
    expect(res.body.genreBooks.length).toBe(1);
    expect(res.body.genreBooks[0]._id).toBe(String(book._id));
  });
});

describe("genreDeleteApi", () => {
  test("HTTP 302: redirect to list view if bad ID provided", async () => {
    const res = await request(app)
      .post(`/genre/xxxx/delete`)
      .send({ genreId: "badObjectId" });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/genres");
  });

  test("HTTP 302: redirect to list view if genre not found", async () => {
    const res = await request(app)
      .post(`/genre/xxxx/delete`)
      .send({ genreId: new Types.ObjectId() });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/genres");
  });

  test("HTTP 200: return genre and all related books without deleting", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "Fantasy Book",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
      genre: [genre._id],
    });
    await Book.create({
      title: "No Genre Book",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "9781234567897",
    });

    expect(await Genre.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/genre/xxxxx/delete`)
      .send({ genreId: genre._id });

    expect(res.status).toBe(200);
    expect(res.body.genre._id).toBe(String(genre._id));
    expect(res.body.genreBooks.length).toBe(1);
    expect(res.body.genreBooks[0]._id).toBe(String(book._id));
    expect(await Genre.countDocuments()).toBe(1);
  });

  test("HTTP 302: delete genre and redirect to list view", async () => {
    const genre = await Genre.create({ name: "Fantasy" });

    expect(await Genre.countDocuments()).toBe(1);

    const res = await request(app)
      .post(`/genre/xxxxx/delete`)
      .send({ genreId: genre._id });

    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to /catalog/genres");
    expect(await Genre.countDocuments()).toBe(0);
  });
});
