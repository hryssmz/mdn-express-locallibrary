// models/author.spec.ts
import { connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Author from "./author";

describe("test Author model", () => {
  test("valid authors", () => {
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

    const author2 = new Author({ firstName: "John", familyName: "" });

    expect(author2.dateOfBirth).toBeUndefined();
    expect(author2.dateOfDeath).toBeUndefined();
    expect(author2.name).toBe("");
    expect(author2.dateOfBirthISO).toBe("");
    expect(author2.dateOfDeathISO).toBe("");
    expect(author2.lifespan).toBe(" - ");
  });

  test("invalid authors", () => {
    const author = new Author();
    const errors = author.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.firstName.message).toBe("Path `firstName` is required.");
    expect(errors.familyName.message).toBe("Path `familyName` is required.");

    const author2 = new Author({
      firstName: Array(200).join("a"),
      familyName: Array(200).join("b"),
    });
    const errors2 = author2.validateSync()?.errors ?? {};

    expect(Object.keys(errors2).length).toBe(2);
    expect(errors2.firstName.message).toBe(
      "Path `firstName` (`" +
        author2.firstName +
        "`) is longer than the maximum allowed length (100)."
    );
    expect(errors2.familyName.message).toBe(
      "Path `familyName` (`" +
        author2.familyName +
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
