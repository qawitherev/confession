/**
 * FeatureService class to manage feature-related operations.
 * This class interacts with the FeatureRepository to perform CRUD operations.
 * @author Abdul Qawi Bin Kamran 
 * @version 0.0.1
 */

class FeatureService {
    constructor(featureRepository) {
        this.featureRepository = featureRepository;
    }

    /**
     * Get the status of a feature.
     * @param {string} feature - Name of the feature.
     * @returns {Promise<boolean>} - True if the feature is enabled, false otherwise.
     */
    async getFeatureStatus(feature) {
        try {
            const res = await this.featureRepository.findFeatureStatus(feature);
            if (res.length === 0) {
                const notFoundError = new Error(`Feature ${feature} not found`);
                notFoundError.statusCode = 404;
                throw notFoundError;
            } else {
                return res[0].isActive;
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = FeatureService;