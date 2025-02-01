const { body, validationResult, header } = require("express-validator");
const ResponseHandler = require("../controller/responseHandler");
const crypto = require("crypto");
const { UserTypeAuth } = require("../security/previlege");

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

  static checkUser(req, res, next) {
    const { id } = req.user; 
    try {
      const isUser = UserTypeAuth.isUser(id); 
      if (!isUser) {
        const err = new Error(`Unauthorized`); 
        err.statusCode = 403; 
        throw err; 
      }
      next(); 
    } catch (err) {
      if(err.statusCode===403) {
        res.status(403).json(ResponseHandler.error(`Something went wrong`, 403, err.message)); 
      } else {
        res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
      }
    }
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
