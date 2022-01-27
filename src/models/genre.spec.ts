// models/genre.spec.ts
import { connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Genre from "./genre";

describe("valid Genre documents", () => {
  test("genre with full valid fields", () => {
    const genre = new Genre({ name: "Fantasy" });

    expect(genre.validateSync()).toBeUndefined();
    // virtuals
    expect(genre.url).toBe(`/catalog/genre/${genre._id}`);
  });
});

describe("invalid Genre documents", () => {
  test("genre without name", () => {
    const genre = new Genre();
    const errors = genre.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe("Path `name` is required.");
  });

  test("genre with too short name", () => {
    const genre = new Genre({ name: "a" });
    const errors = genre.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe(
      "Path `name` (`" +
        genre.name +
        "`) is shorter than the minimum allowed length (3)."
    );
  });

  test("genre with too long name", () => {
    const genre = new Genre({ name: Array(200).join("a") });
    const errors = genre.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe(
      "Path `name` (`" +
        genre.name +
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
    expect(genres[0].name).toStrictEqual(genre.name);
  });

  test("does not save to DB if validation failed", async () => {
    await Genre.create().catch(error => error);
    const genres = await Genre.find();

    expect(genres.length).toBe(0);
  });
});
