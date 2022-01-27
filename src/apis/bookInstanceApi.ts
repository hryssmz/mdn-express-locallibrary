// apis/bookInstanceApi.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { bookInstanceValidator } from "../validators/bookInstanceValidator";
import Book from "../models/book";
import BookInstance, { statusChoices } from "../models/bookInstance";

export const bookInstanceListApi = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  // HTTP 200: return book copy list
  return res.json({ bookInstanceList });
};

export const bookInstanceDetailApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book copy not found");
  }
  const bookInstance = await BookInstance.findById(req.params.id).populate<{
    book: Book;
  }>("book");
  if (bookInstance === null) {
    // HTTP 404: book copy not found
    return res.status(404).json("Book copy not found");
  }
  // HTTP 200: return book copy
  return res.json({ bookInstance });
};

export const bookInstanceCreateGetApi = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title").sort({ title: 1 });
  // HTTP 200: return books and status choices
  return res.json({ bookList, statusChoices });
};

export const bookInstanceCreateApi = async (req: Request, res: Response) => {
  await bookInstanceValidator.run(req);
  const errors = validationResult(req);
  const bookInstanceData = {
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    dueBack: req.body.dueBack,
  };
  if (!errors.isEmpty()) {
    const bookList = await Book.find({}, "title").sort({ title: 1 });
    // HTTP 400: return choices, book copy, and validation errors
    return res.status(400).json({
      bookList,
      statusChoices,
      bookInstance: bookInstanceData,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: create book copy and redirect to detail view
  const bookInstance = await BookInstance.create(req.body);
  return res.redirect(bookInstance.url);
};

export const bookInstanceUpdateGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book copy not found");
  }
  const [bookInstance, bookList] = await Promise.all([
    BookInstance.findById(req.params.id),
    Book.find({}, "title").sort({ title: 1 }),
  ]);
  if (bookInstance === null) {
    // HTTP 404: book copy not found
    return res.status(404).json("Book copy not found");
  }
  // HTTP 200: return books, status choices and book copy
  return res.json({ bookList, statusChoices, bookInstance });
};

export const bookInstanceUpdateApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book copy not found");
  }
  const bookInstance = await BookInstance.findById(req.params.id);
  if (bookInstance === null) {
    // HTTP 404: book copy not found
    return res.status(404).json("Book copy not found");
  }
  await bookInstanceValidator.run(req);
  const errors = validationResult(req);
  const bookInstanceData = {
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    dueBack: req.body.dueBack,
  };
  if (!errors.isEmpty()) {
    const bookList = await Book.find({}, "title").sort({ title: 1 });
    // HTTP 400: return choices, book copy, and validation errors
    return res.status(400).json({
      bookList,
      statusChoices,
      bookInstance: req.body,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: update book copy and redirect to detail view
  await bookInstance.updateOne(bookInstanceData);
  return res.redirect(bookInstance.url);
};

export const bookInstanceDeleteGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/book-instances");
  }
  const bookInstance = await BookInstance.findById(req.params.id);
  if (bookInstance === null) {
    // HTTP 302: redirect to list view if book copy not found
    return res.redirect("/catalog/book-instances");
  }
  // HTTP 200: return book copy
  return res.json({ bookInstance });
};

export const bookInstanceDeleteApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.body.bookInstanceId);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/book-instances");
  }
  const bookInstance = BookInstance.findById(req.body.bookInstanceId);
  if (bookInstance === null) {
    // HTTP 302: redirect to list view if book copy not found
    return res.redirect("/catalog/book-instances");
  }
  // HTTP 302: delete book and redirect to list view
  await bookInstance.deleteOne();
  return res.redirect("/catalog/book-instances");
};
