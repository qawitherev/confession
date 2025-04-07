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

    getAllFeaturesStatus = async (req, res) => {
        try {
            const featuresStatus = await this.featureService.getAllFeaturesStatus();
            res
                .status(200)
                .json(ResponseHandler.success(`Feature status queried`, 200, featuresStatus));
        } catch (err) {
            const statusCode = err.statusCode || 500;
            res
                .status(statusCode)
                .json(ResponseHandler.error(`Something went wrong`, statusCode, err.message));
        }
    }

    /**
     * Update the status of a feature
     * status is ACTIVE or INACTIVE 
     */
    updateFeatureStatus = async (req, res) => {
        const { id, status } = req.body;
        // check if status is valid
        const validStatuses = ['ACTIVE', 'INACTIVE'];
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json(ResponseHandler.error(`Invalid status`, 400, `Status must be one of ${validStatuses.join(', ')}`));
        }
        const convertedStatus = status === "ACTIVE" ? 1 : 0;
        const updator = req.user.id;
        try {
            const fname = await this.featureService.updateFeatureStatus(id, convertedStatus, updator);
            res
                .status(200)
                .json(ResponseHandler.success(`Feature status updated`, 200, `Updated feature ${fname} to ${status}`));
        } catch (err) {
            const statusCode = err.statusCode || 500;
            res
                .status(statusCode)
                .json(ResponseHandler.error(`Something went wrong`, statusCode, err.message));
        }
    }
}

module.exports = FeatureController;