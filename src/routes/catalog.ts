// routes/catalog.ts
import { Router } from "express";
import apiRouter from "./catalogApi";
import { authorList } from "../controllers/authorController";
import { index, bookList } from "../controllers/bookController";
import { bookInstanceList } from "../controllers/bookInstanceController";
import { genreList } from "../controllers/genreController";

const router = Router();

router.use("/api", apiRouter);

router.get("/", index);

router.get("/authors", authorList);

router.get("/books", bookList);

router.get("/book-instances", bookInstanceList);

router.get("/genres", genreList);

export default router;
