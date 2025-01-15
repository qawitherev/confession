const { body, validationResult } = require("express-validator");

const createConfessionMW = [
  body("userId").trim().escape(),
  body("title").trim().escape(),
  body("body").trim().escape(),
  body("tagIds.*").trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const publishRejectSanitize = [
  body("confessionId").trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  createConfessionMW,
  publishRejectSanitize,
};
