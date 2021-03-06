// models/book.spec.ts
import { Types, connection, connect } from "mongoose";
import { testMongoURL } from "../../src/utils";
import Author from "../../src/models/author";
import Book from "../../src/models/book";
import Genre from "../../src/models/genre";

describe("valid Book documents", () => {
  test("book with full valid fields", () => {
    const book = new Book({
      title: "Some Title",
      author: new Types.ObjectId(),
      summary: "A short summary.",
      isbn: "9781234567897",
      genre: [new Types.ObjectId()],
    });

    expect(book.validateSync()).toBeUndefined();
    // virtuals
    expect(book.url).toBe(`/catalog/book/${book._id}`);
  });

  test("book without genre", () => {
    const book = new Book({
      title: "Some Title",
      author: new Types.ObjectId(),
      summary: "A short summary.",
      isbn: "9781234567897",
    });

    expect(book.validateSync()).toBeUndefined();
    expect(book.genre).toStrictEqual([]);
  });
});

describe("invalid Book documents", () => {
  test("book without title, author, summary and isbn", () => {
    const book = new Book();
    const errors = book.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(4);
    expect(errors.title.message).toBe("Path `title` is required.");
    expect(errors.author.message).toBe("Path `author` is required.");
    expect(errors.summary.message).toBe("Path `summary` is required.");
    expect(errors.isbn.message).toBe("Path `isbn` is required.");
  });
});

describe("test DB interactions", () => {
  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Promise.all([
      Author.deleteMany(),
      Book.deleteMany(),
      Genre.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      Author.deleteMany(),
      Book.deleteMany(),
      Genre.deleteMany(),
    ]);
    await connection.close();
  });

  test("can read and write DB", async () => {
    const author = await Author.create({
      firstName: "John",
      familyName: "Doe",
    });
    const genre = await Genre.create({ name: "Fantasy" });
    const book = await Book.create({
      title: "Some Title",
      author: author._id,
      summary: "A short summary.",
      isbn: "9781234567897",
      genre: [genre._id],
    });
    const books = await Book.find()
      .populate<{ author: Author }>("author")
      .populate<{ genre: Genre[] }>("genre");

    expect(books.length).toBe(1);
    expect(books[0]._id).toStrictEqual(book._id);
    expect(books[0].author._id).toStrictEqual(author._id);
    expect(books[0].author.firstName).toBe(author.firstName);
    expect(books[0].summary).toBe(book.summary);
    expect(books[0].isbn).toBe(book.isbn);
    expect(books[0].genre.length).toBe(1);
    expect(books[0].genre[0]._id).toStrictEqual(genre._id);
    expect(books[0].genre[0].name).toStrictEqual(genre.name);
  });

  test("does not save to DB if validation failed", async () => {
    await Book.create().catch(error => error);
    const books = await Book.find();

    expect(books.length).toBe(0);
  });
});
