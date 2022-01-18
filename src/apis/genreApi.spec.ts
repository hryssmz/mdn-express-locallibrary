// apis/genreApi.spec.ts
import express from "express";
import { connect, connection } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Genre from "../models/genre";
import { genreListApi } from "./genreApi";

describe("test genre APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/genres", genreListApi);

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
});
