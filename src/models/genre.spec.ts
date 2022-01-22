// models/genre.spec.ts
import { connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Genre from "./genre";

describe("test Genre model", () => {
  test("valid genres", () => {
    const genre = new Genre({ name: "Fantasy" });

    expect(genre.url).toBe(`/catalog/genre/${genre._id}`);
  });

  test("invalid genres", () => {
    const genre = new Genre();
    const errors = genre.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.name.message).toBe("Path `name` is required.");

    const genre2 = new Genre({ name: "a" });
    const errors2 = genre2.validateSync()?.errors ?? {};

    expect(Object.keys(errors2).length).toBe(1);
    expect(errors2.name.message).toBe(
      "Path `name` (`" +
        genre2.name +
        "`) is shorter than the minimum allowed length (3)."
    );

    const genre3 = new Genre({ name: Array(200).join("a") });
    const errors3 = genre3.validateSync()?.errors ?? {};

    expect(Object.keys(errors3).length).toBe(1);
    expect(errors3.name.message).toBe(
      "Path `name` (`" +
        genre3.name +
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
