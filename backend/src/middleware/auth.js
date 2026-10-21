import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Du måste vara inloggad" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Ogiltig eller utgången inloggning" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Endast administratörer får göra detta" });
  }
  next();
}
