const { body, validationResult } = require("express-validator");
const ResponseHandler = require("../controller/responseHandler");

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