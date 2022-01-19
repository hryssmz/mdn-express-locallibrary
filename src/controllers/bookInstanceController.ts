// controllers/bookInstanceController.ts
import { Request, Response } from "express";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";

export const bookInstanceList = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  return res.render("bookInstanceList", {
    title: "Book Instance List",
    bookInstanceList,
  });
};
