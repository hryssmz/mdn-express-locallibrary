// routes/catalog.ts
import { Router } from "express";
import apiRouter from "./catalogApi";

const router = Router();

router.use("/api", apiRouter);
router.get("/", (req, res) => {
  return res.redirect("/catalog/api");
});

export default router;
