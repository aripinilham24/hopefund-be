import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // cek presence JWT secret
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET not set");
    return res.status(500).json({ message: "Server configuration error." });
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized. Header Authorization tidak ada." });
  }

  // dukung format "Bearer <token>" atau langsung token
  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Token tidak ada." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res.status(403).json({ message: "Token tidak valid." });
  }
};
