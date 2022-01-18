// apis/authorApi.spec.ts
import express from "express";
import { connect, connection } from "mongoose";
import request from "supertest";
import { testMongoURL } from "../utils";
import Author from "../models/author";
import { authorListApi } from "./authorApi";

describe("test author APIs", () => {
  const app = express();
  app.use(express.json());
  app.get("/authors", authorListApi);

  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Author.deleteMany();
  });

  afterAll(async () => {
    await Author.deleteMany();
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
});
