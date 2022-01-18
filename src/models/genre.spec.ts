// models/genre.spec.ts
import { connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Genre from "./genre";

describe("test Genre model", () => {
  test("genre with full info", () => {
    const genre = new Genre({ name: "Fantasy" });

    expect(genre.url).toBe(`/catalog/genre/${genre._id}`);
  });

  test("invalid genre without the required properties", () => {
    const error = new Genre().validateSync();
    const errors = error ? error.errors : {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe("Path `name` is required.");
  });

  test("invalid genre with a short name", () => {
    const name = "a";
    const error = new Genre({ name }).validateSync();
    const errors = error ? error.errors : {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe(
      "Path `name` (`" +
        name +
        "`) is shorter than the minimum allowed length (3)."
    );
  });

  test("invalid genre with a long name", () => {
    const name = Array(200).join("a");
    const error = new Genre({ name }).validateSync();
    const errors = error ? error.errors : {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe(
      "Path `name` (`" +
        name +
        "`) is longer than the maximum allowed length (100)."
    );
  });
});

describe("test DB interactions", () => {
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

  test("can read and write DB", async () => {
    const genre = await Genre.create({ name: "Fantasy" });
    const genres = await Genre.find();

    expect(genres.length).toBe(1);
    expect(genres[0]._id).toStrictEqual(genre._id);
  });

  test("does not save to DB if validation failed", async () => {
    await Genre.create().catch(error => error);
    const genres = await Genre.find();

    expect(genres.length).toBe(0);
  });
});
