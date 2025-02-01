const pool = require('../config/database');
const express = require('express');

const UserRepository = require('../repositories/userRepository');
const UserService = require('../service/userService');
const UserController = require('../controller/userControllerV2');
const UserMiddleware = require('../middleware/userMiddlewareV2');
const ConfessionRepository = require('../repositories/confessionRepository');
const ConfessionService = require('../service/confessionService');
const ConfessionController = require('../controller/confessionControllerV2');
const JWToken = require('../security/jsonWebToken');
const ConfessionMiddlewareV2 = require('../middleware/confessionMiddlewareV2');

//DEPENDECIES INJECTION SETUP 
//user
const userRepository = new UserRepository(pool);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

//Confession 
const confessionRepository = new ConfessionRepository(pool);
const confessionService = new ConfessionService(confessionRepository);
const confessionController = new ConfessionController(confessionService);

//END 


//user route  
const userRouter = express.Router();
userRouter.post('/signUp', UserMiddleware.signUpMiddleware, userController.signUp); 
userRouter.post('/login', UserMiddleware.loginMiddleware, userController.login);
userRouter.post('/logout', UserMiddleware.logoutMiddleware, userController.logout);
userRouter.get('/reactions', JWToken.verifyToken, UserMiddleware.checkUser, userController.getUserReactions); 

//confession route 
const confessionRouter = express.Router();
confessionRouter.post('/createConfession', JWToken.verifyToken, ConfessionMiddlewareV2.createConfessionMW, confessionController.createConfession);
confessionRouter.get(`/getAllTags`, JWToken.verifyToken, confessionController.getAllTags);
confessionRouter.get('/getPendingConfessions', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, confessionController.getPendingConfessions);
confessionRouter.get('/getPublishedConfessions', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, confessionController.getPublishedConfessions);
confessionRouter.get('/getRejectedConfessions', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, confessionController.getRejectedConfessions);
confessionRouter.post('/publishConfession', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, ConfessionMiddlewareV2.updateConfessionStatusMW, confessionController.publishConfession); 
confessionRouter.post('/rejectConfession', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, ConfessionMiddlewareV2.updateConfessionStatusMW, confessionController.rejectConfession); 
confessionRouter.get('/getConfessions', JWToken.verifyToken, ConfessionMiddlewareV2.checkUser, confessionController.getConfessions);
confessionRouter.post('/reactConfession', JWToken.verifyToken, ConfessionMiddlewareV2.checkUser, ConfessionMiddlewareV2.reactConfessionMW, confessionController.reactConfession); 



module.exports = {
    userRouter, 
    confessionRouter
}