// routes/index.ts
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello World", query: req.query });
});

export default router;
