// routes/catalog.ts
import { Router } from "express";
import apiRouter from "./catalogApi";
import { authorList, authorDetail } from "../controllers/authorController";
import { index, bookList, bookDetail } from "../controllers/bookController";
import {
  bookInstanceList,
  bookInstanceDetail,
} from "../controllers/bookInstanceController";
import { genreList, genreDetail } from "../controllers/genreController";

const router = Router();

router.use("/api", apiRouter);

router.get("/", index);

router.get("/authors", authorList);
router.get("/author/:id", authorDetail);

router.get("/books", bookList);
router.get("/book/:id", bookDetail);

router.get("/book-instances", bookInstanceList);
router.get("/book-instance/:id", bookInstanceDetail);

router.get("/genres", genreList);
router.get("/genre/:id", genreDetail);

export default router;
