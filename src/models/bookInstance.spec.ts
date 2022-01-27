// models/bookInstance.spec.ts
import { Types, connection, connect } from "mongoose";
import { testMongoURL } from "../utils";
import Book from "./book";
import BookInstance from "./bookInstance";

describe("valid BookInstance documents", () => {
  test("bookInstance with full valid fields", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
      status: "Loaned",
      dueBack: new Date("2020-01-01"),
    });

    expect(bookInstance.validateSync()).toBeUndefined();
    // virtuals
    expect(bookInstance.url).toBe(`/catalog/book-instance/${bookInstance._id}`);
    expect(bookInstance.dueBackFormatted).toBe("Jan 1, 2020");
    expect(bookInstance.dueBackISO).toBe("2020-01-01");
  });

  test("bookInstance without status and dueBack", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
    });

    expect(bookInstance.validateSync()).toBeUndefined();
    // Default to Maintenance.
    expect(bookInstance.status).toBe("Maintenance");
    // Default to current Date().
    expect(Date.now() - Number(bookInstance.dueBack)).toBeLessThan(10);
  });

  test("bookInstance with empty dueBack", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
      dueBack: "",
    });

    expect(bookInstance.validateSync()).toBeUndefined();
    expect(bookInstance.dueBackFormatted).toBe("");
    expect(bookInstance.dueBackISO).toBe("");
  });
});

describe("invalid BookInstance documents", () => {
  test("bookInstance without book and imprint", () => {
    const bookInstance = new BookInstance();
    const errors = bookInstance.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(2);
    expect(errors.book.message).toBe("Path `book` is required.");
    expect(errors.imprint.message).toBe("Path `imprint` is required.");
  });

  test("invalid status provided", () => {
    const bookInstance = new BookInstance({
      book: new Types.ObjectId(),
      imprint: "Foo Imprint",
      status: "BadStatus",
      dueBack: new Date("2020-01-01"),
    });
    const errors = bookInstance.validateSync()?.errors ?? {};

    expect(Object.keys(errors).length).toBe(1);
    expect(errors.status.message).toBe(
      "`" +
        bookInstance.status +
        "` is not a valid enum value for path `status`."
    );
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
      isbn: "9781234567897",
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
    expect(bookInstances[0].imprint).toStrictEqual(bookInstance.imprint);
    expect(Date.now() - Number(bookInstances[0].dueBack)).toBeLessThan(100);
  });

  test("does not save to DB if validation failed", async () => {
    await BookInstance.create().catch(error => error);
    const bookInstances = await BookInstance.find();

    expect(bookInstances.length).toBe(0);
  });
});
