// apis/genreApi.spec.ts
import express from "express";
import { connect, connection, Types } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Book from "../models/book";
import Genre from "../models/genre";
import { genreListApi, genreDetailApi, genreCreateApi } from "./genreApi";

describe("test genre APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/genres", genreListApi);
  app.get("/genre/:id", genreDetailApi);
  app.post("/genres/create", genreCreateApi);

  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Genre.deleteMany();
  });

  afterAll(async () => {
    await Genre.deleteMany();
    await connection.close();
  });

  test("GET /genres", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    await Genre.create({ name: "Essay" });
    const res = await request(app).get("/genres");

    expect(res.status).toBe(200);
    expect(res.body.genreList.length).toBe(2);
    expect(res.body.genreList[1]._id).toBe(String(genre._id));
  });

  test("GET /genre/:id", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "The Test Title",
      author: new Types.ObjectId(),
      summary: "Here's a short summary.",
      isbn: "1234567890000",
      genre: [genre._id],
    });
    const res = await request(app).get(`/genre/${genre._id}`);

    expect(res.status).toBe(200);
    expect(res.body.genre._id).toBe(String(genre._id));
    expect(res.body.genreBooks.length).toBe(1);
    expect(res.body.genreBooks[0]._id).toBe(String(book._id));

    const res2 = await request(app).get(`/genre/${new Types.ObjectId()}`);

    expect(res2.status).toBe(404);
    expect(res2.body).toBe("Genre not found");

    const res3 = await request(app).get("/genre/foobar");

    expect(res3.status).toBe(500);
    expect(res3.body.name).toBe("CastError");
  });

  test("POST /genres/create", async () => {
    const res = await request(app)
      .post("/genres/create")
      .send({ name: "     Fantasy     " });

    expect(res.status).toBe(302);

    const genres = await Genre.find({ name: "Fantasy" });

    expect(genres.length).toBe(1);
    expect(genres[0].name).toBe("Fantasy");
    expect(res.text).toBe(`Found. Redirecting to ${genres[0].url}`);

    // Create an genre with an existing name.
    const res2 = await request(app)
      .post("/genres/create")
      .send({ name: "Fantasy" });

    expect(res2.status).toBe(302);
    expect(res2.text).toBe(`Found. Redirecting to ${genres[0].url}`);
    expect(await Genre.countDocuments()).toBe(1);

    const res3 = await request(app).post("/genres/create");

    expect(res3.status).toBe(400);
    expect(res3.body.genre).toStrictEqual({ name: "" });
    expect(res3.body.errors.length).toBe(1);
    expect(res3.body.errors[0]).toStrictEqual({
      location: "body",
      msg: "Genre name required",
      param: "name",
      value: "",
    });

    const res4 = await request(app)
      .post("/genres/create")
      .send({ _id: "foobar", name: "Fantasy" });

    expect(res4.status).toBe(500);
    expect(res4.body.name).toBe("CastError");
  });
});
