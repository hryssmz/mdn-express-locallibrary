// models/bookInstance.spec.ts
import { Types, connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Book from "./book";
import BookInstance from "./bookInstance";

describe("testing BookInstance model", () => {
  test("bookInstance with full info", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
      status: "Loaned",
      dueBack: new Date("2020-01-01"),
    });

    expect(bookInstance.url).toBe(`/catalog/book-instance/${bookInstance._id}`);
    expect(bookInstance.dueBackFormatted).toBe("Jan 1, 2020");
    expect(bookInstance.dueBackISO).toBe("2020-01-01");
  });

  test("bookInstance without status and dueBack", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
    });

    expect(bookInstance.status).toBe("Maintenance");
    expect(Date.now() - Number(bookInstance.dueBack)).toBeLessThan(10);
  });

  test("bookInstance with empty dueBack", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
      dueBack: "",
    });

    expect(bookInstance.dueBackFormatted).toBe("");
    expect(bookInstance.dueBackISO).toBe("");
  });

  test("invalid bookInstance without the required properties", () => {
    const error = new BookInstance().validateSync();
    const errors = error ? error.errors : {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.book.message).toBe("Path `book` is required.");
    expect(errors.imprint.message).toBe("Path `imprint` is required.");
  });
});

describe("test DB interactions", () => {
  beforeAll(async () => {
    await connect(testMongoURL);
  });

  beforeEach(async () => {
    await Promise.all([Book.deleteMany(), BookInstance.deleteMany()]);
  });

  afterAll(async () => {
    await Promise.all([Book.deleteMany(), BookInstance.deleteMany()]);
    await connection.close();
  });

  test("can read and write DB", async () => {
    const book = await Book.create({
      title: "Some Title",
      author: new Types.ObjectId(),
      summary: "A short summary.",
      isbn: "1234567890000",
    });
    const bookInstance = await BookInstance.create({
      book: book._id,
      imprint: "Foo Imprint",
    });
    const bookInstances = await BookInstance.find().populate<{ book: Book }>(
      "book"
    );

    expect(bookInstances.length).toBe(1);
    expect(bookInstances[0]._id).toStrictEqual(bookInstance._id);
    expect(bookInstances[0].book._id).toStrictEqual(book._id);
    expect(bookInstances[0].book.title).toBe(book.title);
  });

  test("does not save to DB if validation failed", async () => {
    await BookInstance.create().catch(error => error);
    const bookInstances = await BookInstance.find();

    expect(bookInstances.length).toBe(0);
  });
});