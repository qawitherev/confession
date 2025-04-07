/**
 * FeatureController class
 * This class is responsible for handling feature-related operations.
 * It interacts with the FeatureService to handle api endpoints.
 * @author Abdul Qawi Bin Kamran
 * @version 0.0.1
 */

const ResponseHandler = require("./responseHandler");

class FeatureController {
    constructor(featureService) {
        this.featureService = featureService;
    }

    getFeatureStatus = async (req, res) => {
        const { feature } = req.params;
        try {
            const isActive = await this.featureService.getFeatureStatus(feature);
            res
                .status(200)
                .json(ResponseHandler.success(`Feature status queried`, 200, isActive));
        } catch (err) {
            const statusCode = err.statusCode || 500;
            res
                .status(statusCode)
                .json(ResponseHandler.error(`Something went wrong`, statusCode, err.message));
        }
    }
}

module.exports = FeatureController;