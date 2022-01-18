// routes/index.ts
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", { message: "Hello World", query: req.query });
});

export default router;
