import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import ResponseHandler from "../controller/responseHandler.js";

dotenv.config();

class JWToken {
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, username: user.name },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
  }

  static async verifyToken(req, res, next) {
    const token = req.headers[`authorization`];
    if(!token) {
      return res.status(401).json(ResponseHandler.error(`Token not found in request header`, 401, null));
    }
    const isBlacklisted = await JWToken.isBlacklisted(token);
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err || isBlacklisted) {
        return res.status(401).json(ResponseHandler.error(`Token could not be verified`, 401, null));
      }
      req.user = decoded; 
      next(); 
    })
  }

  static blacklistToken(token , expirationSeconds) {
    redisClient.setEx(token, expirationSeconds, 'blacklisted');
  }

 static async isBlacklisted(token) {
  try {
    const exists = await redisClient.exists(token);
    return exists === 1;
  } catch (err) {
    return true; // --> blacklisted on default for security measure 
  }
 }
}

export default JWToken;

// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user.id, username: user.name },
//     process.env.SECRET_KEY,
//     { expiresIn: "1h" }
//   );
// };

// const verifyToken = (req, res, next) => {
//   const token = req.headers["authorization"];
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "No token provided",
//     });
//   }
//   jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({
//         success: false,
//         message: "Failed to authenticate token",
//       });
//     }
//     req.user = decoded; 
//     next();
//   });
// };

// const blacklistToken  = (token, expirationSeconds) => {
//   redisClient.setEx(token, expirationSeconds, 'blacklisted');
// };

// const isTokenBlacklisted = (token, callback) => {
//   redisClient.exists(token, (err, reply) => {
//     if (err) {
//       return callback(err, null);
//     }
//     return callback(null, reply === 1);
//   });
// };

// module.exports = {
//   generateToken,
//   verifyToken,
//   blacklistToken, 
//   isTokenBlacklisted
// };
