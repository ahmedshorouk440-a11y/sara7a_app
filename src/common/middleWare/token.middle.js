
import jwt from "jsonwebtoken";
import { BadRequestExcption, UnauthroziedExption } from "../Exption/index.js";

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) UnauthroziedExption("Authorization header is missing");

    const [flag, token] = header.split(" ");
    if (flag !== "Bearer" || !token) BadRequestExcption("Invalid Authorization");

    const decoded = jwt.decode(token);
    if (!decoded) BadRequestExcption("Invalid token");

    let signature;
    switch (decoded.aud) {
      case "admin":
        signature = process.env.ADMIN_SIGNATURE;
        break;
      case "user":
        signature = process.env.USER_SIGNATURE;
        break;
      default:
        BadRequestExcption("Invalid Authorization");
    }

    req.user = jwt.verify(token, signature);
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    next(error);
  }
};
