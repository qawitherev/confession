const { body, validationResult } = require("express-validator");
const ResponseHandler = require("../controller/responseHandler");
const { UserTypeAuth } = require("../security/previlege");

class ConfessionMiddlewareV2 {
    static createConfessionMW = [
      body("title")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Title cannot be empty"),
      body("body").trim().escape().notEmpty().withMessage("Body cannot be empty"),
      body("tagIds").custom((value) => {
        if(!Array.isArray(value)) {
          throw new Error('TagIds must be an array of number')
        }
        return value;
      }), 
      this.handleValidationErrors,
    ];

    static updateConfessionStatusMW = [
      body('confessionId').trim().escape().isNumeric(), 
      this.handleValidationErrors
    ]

    static checkAdmin = async(req, res, next) => {
      const { id } = req.user; 
      
      try {
        const isAdmin = await UserTypeAuth.isAdmin(id); 
        if(isAdmin) {
          next(); 
        } else {
          const err = new Error(`User is not an admin`); 
          throw err;
        }
      } catch (err) {
        res.status(403).json(ResponseHandler.error(err.message, 401, err)); 
      }
    }

    static checkUser = async(req, res, next) => {
      const { id } = req.user; 
      
      try {
        const isAdmin = await UserTypeAuth.isUser(id); 
        if(isAdmin) {
          next(); 
        } else {
          const err = new Error(`Only user is able to GET`); 
          throw err;
        }
      } catch (err) {
        res.status(403).json(ResponseHandler.error(err.message, 401, err)); 
      }
    }
  
    static handleValidationErrors(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(500)
          .json(
            ResponseHandler.error(`Field validation failed`, 500, errors.array())
          );
      }
      next();
    }
  }

  module.exports = ConfessionMiddlewareV2;