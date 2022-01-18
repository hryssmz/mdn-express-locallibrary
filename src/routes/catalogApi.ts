// routes/catalogApi.ts
import { Router } from "express";
import {
  authorListApi,
  authorDetailApi,
  authorCreateApi,
} from "../apis/authorApi";
import {
  indexApi,
  bookListApi,
  bookDetailApi,
  bookCreateGetApi,
  bookCreateApi,
} from "../apis/bookApi";
import {
  bookInstanceListApi,
  bookInstanceDetailApi,
  bookInstanceCreateGetApi,
  bookInstanceCreateApi,
} from "../apis/bookInstanceApi";
import { genreListApi, genreDetailApi, genreCreateApi } from "../apis/genreApi";

const router = Router();

router.get("/", indexApi);

router.get("/authors", authorListApi);
router.get("/author/:id", authorDetailApi);
router.post("/authors/create", authorCreateApi);

router.get("/books", bookListApi);
router.get("/book/:id", bookDetailApi);
router.get("/books/create", bookCreateGetApi);
router.post("/books/create", bookCreateApi);

router.get("/book-instances", bookInstanceListApi);
router.get("/book-instance/:id", bookInstanceDetailApi);
router.get("/book-instances/create", bookInstanceCreateGetApi);
router.post("/book-instances/create", bookInstanceCreateApi);

router.get("/genres", genreListApi);
router.get("/genre/:id", genreDetailApi);
router.post("/genres/create", genreCreateApi);

export default router;
