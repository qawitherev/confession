const crypto = require('crypto');
const { body, validationResult, header } = require('express-validator');
const { logout } = require('../controller/userController');

const sanitizeAndHash = [
    body('username').trim().escape(),
    body('nickname').trim().escape(),
    body('password').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { password } = req.body;
        req.body.hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        // console.info(req.body.hashedPassword);
        next();
    }
];

const loginMiddleware = [
    body('username').trim().escape(), 
    body('password').trim().escape(), 
    (req, res, next) => {
        const errors = validationResult(req); 
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const { password } = req.body;
        req.body.hashedPassword = crypto.createHash('sha-256').update(password).digest('hex');
        next();
    }
];

const logoutMiddleware = [
    header('authorization').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    }
]

const sanitizeUserDetails = [
    body('id').trim().escape(),
    body('nickname').trim().escape(), 
    (req, res, next) => {
        const errors = validationResult(req); 
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    }
];

const sanitizeUserId = [
    body('id').trim().escape(), 
    (req, res, next) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array});
        }
        // const { id } = req.body;
        // console.info(`the id from body is ${id}`)
        next(); 
    }
];

module.exports = {
    sanitizeAndHash, 
    sanitizeUserId, 
    sanitizeUserDetails, 
    loginMiddleware, 
    logoutMiddleware
}
