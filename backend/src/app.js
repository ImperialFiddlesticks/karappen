import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import meRouter from "./routes/me.js";
import { requireAuth } from "./middleware/auth.js";
import eventsRouter from "./routes/events.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/me", requireAuth, meRouter);
app.use("/events", requireAuth, eventsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Hittades inte" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Något gick fel på servern" });
});

export default app;
