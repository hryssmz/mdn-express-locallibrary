// apis/authorApi.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authorValidator } from "../validators/authorValidator";
import Author from "../models/author";
import Book from "../models/book";

export const authorListApi = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  return res.json({ authorList });
};

export const authorDetailApi = async (req: Request, res: Response) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }, "title summary"),
    ]);
    if (author === null) {
      return res.status(404).json("Author not found");
    }
    return res.json({ author, authorsBooks });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const authorCreateApi = async (req: Request, res: Response) => {
  await authorValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ author: req.body, errors: errors.mapped() });
  }
  try {
    const author = await Author.create(req.body);
    return res.redirect(author.url);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const authorUpdateGetApi = async (req: Request, res: Response) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author === null) {
      return res.status(404).json("Author not found");
    }
    return res.json({ author });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const authorUpdateApi = async (req: Request, res: Response) => {
  await authorValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ author: req.body, errors: errors.mapped() });
  }
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body);
    if (author === null) {
      return res.status(404).json("Author not found");
    }
    return res.redirect(author.url);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const authorDeleteGetApi = async (req: Request, res: Response) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }),
    ]);
    if (author === null) {
      return res.redirect("/catalog/authors");
    }
    return res.json({ author, authorsBooks });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const authorDeleteApi = async (req: Request, res: Response) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.body.authorId),
      Book.find({ author: req.body.authorId }),
    ]);
    if (authorsBooks.length > 0) {
      return res.json({ author, authorsBooks });
    }
    await Author.findByIdAndRemove(req.body.authorId);
    return res.redirect("/catalog/authors");
  } catch (err) {
    return res.status(500).json(err);
  }
};
