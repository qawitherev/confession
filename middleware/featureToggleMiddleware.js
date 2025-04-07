const ResponseHandler = require("../controller/responseHandler");

class FeatureToggleMW {
    constructor(featureService) {
        this.featureService = featureService;
    }

    //returning a function because middleware expects a middleware function, not bool
    isFeatureEnabled = (feature) => {
        return async (req, res, next) => {
            try {
                const isEnabled = await this.featureService.getFeatureStatus(feature);
                if (isEnabled) {
                    next();
                } else {
                    const err = new Error(`Feature ${feature} is disabled`);
                    err.statusCode = 403;
                    throw err;
                }
            } catch (err) {
                const statusCode = err.statusCode || 500;
                res.status(statusCode).json(ResponseHandler.error(err.message, statusCode, err));
            }
        }
    }
}

module.exports = FeatureToggleMW;