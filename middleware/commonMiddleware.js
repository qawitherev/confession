import { body, validationResult } from "express-validator";


const sanitizeId = [
    body('id').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array });
        }
        next();
    }
]

module.exports = {
    sanitizeId
}