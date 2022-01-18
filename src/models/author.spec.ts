// models/author.spec.ts
import { connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Author from "./author";

describe("test Author model", () => {
  test("author with full name and lifespan", () => {
    const author = new Author({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: new Date("1970-01-01"),
      dateOfDeath: new Date("2020-12-31"),
    });

    expect(author.name).toBe("John, Doe");
    expect(author.dateOfBirthISO).toBe("1970-01-01");
    expect(author.dateOfDeathISO).toBe("2020-12-31");
    expect(author.lifespan).toBe("Jan 1, 1970 - Dec 31, 2020");
    expect(author.url).toBe(`/catalog/author/${author._id}`);
  });

  test("author with empty familyName and no birth info", () => {
    const author = new Author({ firstName: "John", familyName: "" });

    expect(author.dateOfBirth).toBeUndefined();
    expect(author.dateOfDeath).toBeUndefined();
    expect(author.name).toBe("");
    expect(author.dateOfBirthISO).toBe("");
    expect(author.dateOfDeathISO).toBe("");
    expect(author.lifespan).toBe(" - ");
  });

  test("invalid author without the required properties", () => {
    const error = new Author().validateSync();
    const errors = error ? error.errors : {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.firstName.message).toBe("Path `firstName` is required.");
    expect(errors.familyName.message).toBe("Path `familyName` is required.");
  });

  test("invalid author with a long firstName and a long familyName", () => {
    const firstName = Array(200).join("a");
    const familyName = Array(200).join("b");
    const error = new Author({ firstName, familyName }).validateSync();
    const errors = error ? error.errors : {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.firstName.message).toBe(
      "Path `firstName` (`" +
        firstName +
        "`) is longer than the maximum allowed length (100)."
    );
    expect(errors.familyName.message).toBe(
      "Path `familyName` (`" +
        familyName +
        "`) is longer than the maximum allowed length (100)."
    );
  });
});

describe("test DB interactions", () => {
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

  test("can read and write DB", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: new Date("1970-01-01"),
      dateOfDeath: new Date("2020-12-31"),
    });
    const authors = await Author.find();

    expect(authors.length).toBe(1);
    expect(authors[0]._id).toStrictEqual(author._id);
  });

  test("does not save to DB if validation failed", async () => {
    await Author.create().catch(error => error);
    const authors = await Author.find();

    expect(authors.length).toBe(0);
  });
});
