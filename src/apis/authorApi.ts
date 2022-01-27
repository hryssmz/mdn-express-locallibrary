// apis/authorApi.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { authorValidator } from "../validators/authorValidator";
import Author from "../models/author";
import Book from "../models/book";

export const authorListApi = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  // HTTP 200: return author list sorted by family name
  return res.json({ authorList });
};

export const authorDetailApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Author not found");
  }
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, "title summary"),
  ]);
  if (author === null) {
    // HTTP 404: author not found
    return res.status(404).json("Author not found");
  }
  // HTTP 200: return author and all her/his books
  return res.json({ author, authorsBooks });
};

export const authorCreateApi = async (req: Request, res: Response) => {
  await authorValidator.run(req);
  const errors = validationResult(req);
  const authorData = {
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    dateOfBirth: req.body.dateOfBirth,
    dateOfDeath: req.body.dateOfDeath,
  };
  if (!errors.isEmpty()) {
    // HTTP 400: return author data and validation errors
    return res
      .status(400)
      .json({ author: authorData, errors: errors.mapped() });
  }
  // HTTP 302: create author and redirect to detail view
  const author = await Author.create(authorData);
  return res.redirect(author.url);
};

export const authorUpdateGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Author not found");
  }
  const author = await Author.findById(req.params.id);
  if (author === null) {
    // HTTP 404: author not found
    return res.status(404).json("Author not found");
  }
  // HTTP 200: return author
  return res.json({ author });
};

export const authorUpdateApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Author not found");
  }
  const author = await Author.findById(req.params.id);
  if (author === null) {
    // HTTP 404: author not found
    return res.status(404).json("Author not found");
  }
  await authorValidator.run(req);
  const errors = validationResult(req);
  const authorData = {
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    dateOfBirth: req.body.dateOfBirth,
    dateOfDeath: req.body.dateOfDeath,
  };
  if (!errors.isEmpty()) {
    // HTTP 400: return author data and validation errors
    return res
      .status(400)
      .json({ author: authorData, errors: errors.mapped() });
  }
  // HTTP 302: update author and redirect to detail view
  await author.updateOne(authorData);
  return res.redirect(author.url);
};

export const authorDeleteGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/authors");
  }
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }),
  ]);
  if (author === null) {
    // HTTP 302: redirect to list view if author not found
    return res.redirect("/catalog/authors");
  }
  // HTTP 200: return author and all her/his books
  return res.json({ author, authorsBooks });
};

export const authorDeleteApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.body.authorId);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/authors");
  }
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.body.authorId),
    Book.find({ author: req.body.authorId }),
  ]);
  if (author === null) {
    // HTTP 302: redirect to list view if author not found
    return res.redirect("/catalog/authors");
  }
  if (authorsBooks.length > 0) {
    // HTTP 200: return author and all her/his books without deleting
    return res.json({ author, authorsBooks });
  }
  // HTTP 302: delete author and redirect to list view
  await author.deleteOne();
  return res.redirect("/catalog/authors");
};
