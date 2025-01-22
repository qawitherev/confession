const { body, validationResult, header } = require("express-validator");
const ResponseHandler = require("../controller/responseHandler");
const crypto = require("crypto");

class UserMiddleware {
  static signUpMiddleware = [
    body("username").trim().escape().notEmpty(),
    body("password").trim().escape().notEmpty(),
    body("nickname").trim().escape().notEmpty(),
    UserMiddleware.handleValidationErrors,
    UserMiddleware.hashPassword,
  ];

  static loginMiddleware = [
    body('username').trim().escape().notEmpty(),
    body('username').trim().escape().notEmpty(),
    this.handleValidationErrors, 
    this.hashPassword
  ];

  static logoutMiddleware = [
    header('authorization').trim().notEmpty().withMessage('Authorization header is required'),
    this.handleValidationErrors
  ];

  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ResponseHandler.error(`Field validation failed`, 500, errors.array()));
    }
    next();
  }

  static hashPassword(req, res, next) {
    const { password } = req.body;
    req.body.hashedPassword = crypto
      .createHash("sha-256")
      .update(password)
      .digest("hex");
    delete req.body.password;
    next();
  }
}

module.exports = UserMiddleware;
