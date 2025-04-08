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
const FeatureRepository = require('../repositories/FeatureRepository');
const FeatureService = require('../service/featureService');
const FeatureController = require('../controller/featureContoller');
const FeatureToggleMW = require('../middleware/featureToggleMiddleware');
const { sanitizeId } = require('../middleware/commonMiddleware');

//DEPENDECIES INJECTION SETUP 
//user
const userRepository = new UserRepository(pool);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

//Confession 
const confessionRepository = new ConfessionRepository(pool);
const confessionService = new ConfessionService(confessionRepository);
const confessionController = new ConfessionController(confessionService);

//Feature 
const featureRepo = new FeatureRepository(pool); 
const featureService = new FeatureService(featureRepo);
const featureController = new FeatureController(featureService);

//END 

//FACTORY MIDDLEWARE SETUP
//Feature 
const featureToggle = new FeatureToggleMW(featureService);


//user routes
const userRouter = express.Router();
userRouter.post('/signUp', featureToggle.isFeatureEnabled('sign-up'), UserMiddleware.signUpMiddleware, userController.signUp); 
userRouter.post('/login', UserMiddleware.loginMiddleware, userController.login);
userRouter.post('/logout', featureToggle.isFeatureEnabled('logout'), UserMiddleware.logoutMiddleware, userController.logout);
userRouter.get('/reactions', featureToggle.isFeatureEnabled('reactions'), JWToken.verifyToken, UserMiddleware.checkUser, userController.getUserReactions); 
userRouter.get('/getUsers', featureToggle.isFeatureEnabled('get-users'), JWToken.verifyToken, UserMiddleware.checkAdmin, userController.getAllUsersPaged);
userRouter.delete('/deleteUser', featureToggle.isFeatureEnabled('delete-user'), UserMiddleware.deleteUserMiddleware, JWToken.verifyToken, userController.deleteUser);


//confession routes
const confessionRouter = express.Router();
confessionRouter.post('/createConfession', featureToggle.isFeatureEnabled('create-confession'), JWToken.verifyToken, ConfessionMiddlewareV2.createConfessionMW, confessionController.createConfession);
confessionRouter.get(`/getAllTags`, featureToggle.isFeatureEnabled('get-all-tags'), JWToken.verifyToken, confessionController.getAllTags);
confessionRouter.get('/getPendingConfessions', featureToggle.isFeatureEnabled('get-pending-confessions'), JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, confessionController.getPendingConfessions);
confessionRouter.get('/getPublishedConfessions', featureToggle.isFeatureEnabled('get-published-confessions'), JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, confessionController.getPublishedConfessions);
confessionRouter.get('/getRejectedConfessions', featureToggle.isFeatureEnabled('get-rejected-confessions'), JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, confessionController.getRejectedConfessions);
confessionRouter.post('/publishConfession', featureToggle.isFeatureEnabled('publish-confession'), JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, ConfessionMiddlewareV2.updateConfessionStatusMW, confessionController.publishConfession); 
confessionRouter.post('/rejectConfession', featureToggle.isFeatureEnabled('reject-confession'), JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, ConfessionMiddlewareV2.updateConfessionStatusMW, confessionController.rejectConfession); 
confessionRouter.get('/getConfessions', featureToggle.isFeatureEnabled('get-confessions'), JWToken.verifyToken, ConfessionMiddlewareV2.checkUser, confessionController.getConfessions);
confessionRouter.post('/reactConfession', featureToggle.isFeatureEnabled('react-confession'), JWToken.verifyToken, ConfessionMiddlewareV2.checkUser, ConfessionMiddlewareV2.reactConfessionMW, confessionController.reactConfession); 
confessionRouter.get('/getConfessionsForUser', featureToggle.isFeatureEnabled('get-confessions-for-user'), JWToken.verifyToken, ConfessionMiddlewareV2.checkUser, confessionController.getConfessionsForUser);
confessionRouter.delete('/deleteConfession/:id', featureToggle.isFeatureEnabled('delete-confession'), JWToken.verifyToken, ConfessionMiddlewareV2.checkUser, ConfessionMiddlewareV2.sanitizeDeleteConfessionMW, confessionController.deleteConfession);

//feature routes
const featureRouter = express.Router();
featureRouter.get('/getFeatureStatus/:feature', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, featureController.getFeatureStatus);
featureRouter.get('/getAllFeaturesStatus', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, featureController.getAllFeaturesStatus);
featureRouter.post('/updateFeatureStatus', JWToken.verifyToken, ConfessionMiddlewareV2.checkAdmin, sanitizeId, featureController.updateFeatureStatus);



module.exports = {
    userRouter, 
    confessionRouter, 
    featureRouter
}