/*
    this one file will use the controller created and defined the http method 
    DEPRECATED: this file is deprecated and will be removed in the future
*/

const express = require('express');
const userRouter = express.Router();
const confessionRouter = express.Router();
const userController = require('../controller/userController');
const confessionController = require('../controller/confessionController');
const userMiddleware = require('../middleware/userMiddleware');
const { createConfessionMW, publishRejectSanitize } = require('../middleware/confessionMiddleware');
const { verifyToken } = require('../security/jsonWebToken');
const { checkAdmin } = require('../security/previlege');

//user
/**
 * @swagger
 * /user/createUser:
 *   get:
 *     summary: Retrieve a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
userRouter.post('/signUp', userMiddleware.sanitizeAndHash, userController.signUp);
userRouter.post('/login', userMiddleware.loginMiddleware, userController.login);
userRouter.post('/logout', userMiddleware.logoutMiddleware, userController.logout);
userRouter.post('/getAllUser', userController.getAllUser);
userRouter.get('/getUserById', userMiddleware.sanitizeUserId, userController.getUserById);
userRouter.post('/updateUserById', userMiddleware.sanitizeUserDetails, userController.updateUserById);
userRouter.post('/deleteUserById', userMiddleware.sanitizeUserId, userController.deleteUserById);

//confession 
confessionRouter.post('/createConfession', verifyToken, createConfessionMW, confessionController.createConfession);
confessionRouter.get('/getTags', confessionController.getAllTags);
confessionRouter.get('/getPublishedConfessions', verifyToken, confessionController.getPublishedConfessions);
confessionRouter.get('/getPendingConfessions', verifyToken, checkAdmin, confessionController.getPendingConfessions);
confessionRouter.post('/publishConfession', publishRejectSanitize, verifyToken, checkAdmin, confessionController.publishConfession);
confessionRouter.post('/rejectConfession', publishRejectSanitize, verifyToken, checkAdmin, confessionController.rejectConfession);
confessionRouter.get('/getPublishedConfessionsAdmin', verifyToken, checkAdmin, confessionController.getPublishedConfessionAdmin);
confessionRouter.get('/getRejectedConfessionsAdmin', verifyToken, checkAdmin, confessionController.getRejectedConfessionAdmin);

export {
    userRouter,
    confessionRouter
};


