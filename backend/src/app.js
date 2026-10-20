import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: app.use("/auth", authRouter);
// TODO: app.use("/events", eventsRouter);
// TODO: app.use("/me", meRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Hittades inte" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Något gick fel på servern" });
});

export default app;
