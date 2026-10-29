
import jwt from "jsonwebtoken";
import { BadRequestExction } from "../../Exption/index.js";

export const auth = async (req, res, next) => {
  try {
    let [flag, token] = req.headers.authorization.split(" ");

    switch (flag) {
      case "Bearer":
        let decoded = jwt.decode(token);

        let Signature;

        switch (decoded.aud) {
          case "admin":
            Signature = "AdminSignature";
            break;

          case "user":
            Signature = "UserSignature";
            break;

          default:
            throw BadRequestExction({ message: "Invalid Audience" });
        }

        let decodedData = await jwt.verify(token, Signature);

        req.user = decodedData;

        next();

        break;

      default:
        throw BadRequestExction({ message: "Invalid Authorization" });
    }
  } catch (error) {
    next(error);
  }
};
