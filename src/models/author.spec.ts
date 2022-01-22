// models/author.spec.ts
import { connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Author from "./author";

describe("valid Author documents", () => {
  test("author will full valid fields", () => {
    const author = new Author({
      firstName: "John",
      familyName: "Doe",
      dateOfBirth: new Date("1970-01-01"),
      dateOfDeath: new Date("2020-12-31"),
    });

    // virtuals
    expect(author.name).toBe("John, Doe");
    expect(author.dateOfBirthISO).toBe("1970-01-01");
    expect(author.dateOfDeathISO).toBe("2020-12-31");
    expect(author.lifespan).toBe("Jan 1, 1970 - Dec 31, 2020");
    expect(author.url).toBe(`/catalog/author/${author._id}`);
  });

  test("author without dates and with an empty family name", () => {
    const author = new Author({ firstName: "John", familyName: "" });

    expect(author.dateOfBirth).toBeUndefined();
    expect(author.dateOfDeath).toBeUndefined();
    // virtuals
    expect(author.name).toBe("");
    expect(author.dateOfBirthISO).toBe("");
    expect(author.dateOfDeathISO).toBe("");
    expect(author.lifespan).toBe(" - ");
  });
});

describe("invalid Author documents", () => {
  test("author without name", () => {
    const author = new Author();
    const errors = author.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.firstName.message).toBe("Path `firstName` is required.");
    expect(errors.familyName.message).toBe("Path `familyName` is required.");
  });

  test("author with a very long name", () => {
    const author = new Author({
      firstName: Array(200).join("a"),
      familyName: Array(200).join("b"),
    });
    const errors = author.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.firstName.message).toBe(
      "Path `firstName` (`" +
        author.firstName +
        "`) is longer than the maximum allowed length (100)."
    );
    expect(errors.familyName.message).toBe(
      "Path `familyName` (`" +
        author.familyName +
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
    });
    const authors = await Author.find();

    expect(authors.length).toBe(1);
    expect(authors[0]._id).toStrictEqual(author._id);
    expect(authors[0].firstName).toStrictEqual(author.firstName);
    expect(authors[0].familyName).toStrictEqual(author.familyName);
    expect(authors[0].dateOfBirth).toStrictEqual(author.dateOfBirth);
    expect(authors[0].dateOfDeath).toBeUndefined();
  });

  test("does not save to DB if validation failed", async () => {
    await Author.create().catch(error => error);
    const authors = await Author.find();

    expect(authors.length).toBe(0);
  });
});
