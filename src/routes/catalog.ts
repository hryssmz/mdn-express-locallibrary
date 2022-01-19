// routes/catalog.ts
import { Router } from "express";
import apiRouter from "./catalogApi";
import {
  authorList,
  authorDetail,
  authorCreateGet,
  authorCreate,
} from "../controllers/authorController";
import {
  index,
  bookList,
  bookDetail,
  bookCreateGet,
  bookCreate,
} from "../controllers/bookController";
import {
  bookInstanceList,
  bookInstanceDetail,
  bookInstanceCreateGet,
  bookInstanceCreate,
} from "../controllers/bookInstanceController";
import {
  genreList,
  genreDetail,
  genreCreateGet,
  genreCreate,
} from "../controllers/genreController";

const router = Router();

router.use("/api", apiRouter);

router.get("/", index);

router.get("/authors", authorList);
router.get("/author/:id", authorDetail);
router.get("/authors/create", authorCreateGet);
router.post("/authors/create", authorCreate);

router.get("/books", bookList);
router.get("/book/:id", bookDetail);
router.get("/books/create", bookCreateGet);
router.post("/books/create", bookCreate);

router.get("/book-instances", bookInstanceList);
router.get("/book-instance/:id", bookInstanceDetail);
router.get("/book-instances/create", bookInstanceCreateGet);
router.post("/book-instances/create", bookInstanceCreate);

router.get("/genres", genreList);
router.get("/genre/:id", genreDetail);
router.get("/genres/create", genreCreateGet);
router.post("/genres/create", genreCreate);

export default router;
