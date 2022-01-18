// routes/catalogApi.ts
import { Router } from "express";
import { authorListApi, authorDetailApi } from "../apis/authorApi";
import { indexApi, bookListApi, bookDetailApi } from "../apis/bookApi";
import {
  bookInstanceListApi,
  bookInstanceDetailApi,
} from "../apis/bookInstanceApi";
import { genreListApi, genreDetailApi } from "../apis/genreApi";

const router = Router();

router.get("/", indexApi);

router.get("/authors", authorListApi);
router.get("/author/:id", authorDetailApi);

router.get("/books", bookListApi);
router.get("/book/:id", bookDetailApi);

router.get("/book-instances", bookInstanceListApi);
router.get("/book-instance/:id", bookInstanceDetailApi);

router.get("/genres", genreListApi);
router.get("/genre/:id", genreDetailApi);

export default router;
