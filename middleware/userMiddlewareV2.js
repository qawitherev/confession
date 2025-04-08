import { body, validationResult, header, query } from "express-validator";
import ResponseHandler from "../controller/responseHandler.js";
import crypto from "crypto";
import { UserTypeAuth } from "../security/previlege.js";
import { errorMonitor } from "events";

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

  // middleware to sanitize query params
  // two params, userId and deletorId
  static deleteUserMiddleware = [
    query('userId').trim().escape().notEmpty().withMessage('User ID is required'),
    query('userId').isInt().withMessage('User ID must be an integer'),
    query('deletorId').trim().escape().notEmpty().withMessage('Deletor ID is required'),
    query('deletorId').isInt().withMessage('Deletor ID must be an integer'),
    this.handleValidationErrors,
  ];

  static checkUser = async(req, res, next) => {
    const { id } = req.user; 

    try {
      const isUser  = await UserTypeAuth.isUser(id); 
      if (!isUser) {
        const error = new Error(`User is not is a user`);
        throw error; 
      }
      next(); 
    } catch (err) {
      res.status(403).json(ResponseHandler.error(`Unauthorized`, 403, err.message)); 
    }
  }

  static checkAdmin = async(req, res, next) => {
    const { id } = req.user; 

    try {
      const isAdmin = await UserTypeAuth.isAdmin(id); 
      if (!isAdmin) {
        const error = new Error('User is not admin'); 
        throw error; 
      }
      next();
    } catch (err) {
      res.status(403).json(ResponseHandler.error(`Unauthorized`, 403, err.message))
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

export default UserMiddleware;
