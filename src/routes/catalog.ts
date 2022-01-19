// routes/catalog.ts
import { Router } from "express";
import apiRouter from "./catalogApi";
import {
  authorList,
  authorDetail,
  authorCreateGet,
  authorCreate,
  authorUpdateGet,
  authorUpdate,
} from "../controllers/authorController";
import {
  index,
  bookList,
  bookDetail,
  bookCreateGet,
  bookCreate,
  bookUpdateGet,
  bookUpdate,
} from "../controllers/bookController";
import {
  bookInstanceList,
  bookInstanceDetail,
  bookInstanceCreateGet,
  bookInstanceCreate,
  bookInstanceUpdateGet,
  bookInstanceUpdate,
} from "../controllers/bookInstanceController";
import {
  genreList,
  genreDetail,
  genreCreateGet,
  genreCreate,
  genreUpdateGet,
  genreUpdate,
} from "../controllers/genreController";

const router = Router();

router.use("/api", apiRouter);

router.get("/", index);

router.get("/authors", authorList);
router.get("/author/:id", authorDetail);
router.get("/authors/create", authorCreateGet);
router.post("/authors/create", authorCreate);
router.get("/author/:id/update", authorUpdateGet);
router.post("/author/:id/update", authorUpdate);

router.get("/books", bookList);
router.get("/book/:id", bookDetail);
router.get("/books/create", bookCreateGet);
router.post("/books/create", bookCreate);
router.get("/book/:id/update", bookUpdateGet);
router.post("/book/:id/update", bookUpdate);

router.get("/book-instances", bookInstanceList);
router.get("/book-instance/:id", bookInstanceDetail);
router.get("/book-instances/create", bookInstanceCreateGet);
router.post("/book-instances/create", bookInstanceCreate);
router.get("/book-instance/:id/update", bookInstanceUpdateGet);
router.post("/book-instance/:id/update", bookInstanceUpdate);

router.get("/genres", genreList);
router.get("/genre/:id", genreDetail);
router.get("/genres/create", genreCreateGet);
router.post("/genres/create", genreCreate);
router.get("/genre/:id/update", genreUpdateGet);
router.post("/genre/:id/update", genreUpdate);

export default router;
