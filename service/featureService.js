/**
 * FeatureService class to manage feature-related operations.
 * This class interacts with the FeatureRepository to perform CRUD operations.
 * @author Abdul Qawi Bin Kamran
 * @version 0.0.1
 */
import redisClient from "../config/redis.js";

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
      //check first in redis befire hitting db
      const redisRes = await redisClient.get(`feature: ${feature}`);
      if (redisRes) {
        return redisRes === "1" ? true : false;
      }

      //if can't find, fall back to db
      const res = await this.featureRepository.findFeatureStatus(feature);
      if (res.length === 0) {
        const notFoundError = new Error(`Feature ${feature} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      } else {
        await redisClient.setEx(
          `feature: ${feature}`,
          60 * 60,
          res[0].isActive.toString()
        );
        return res[0].isActive;
      }
    } catch (err) {
      throw err;
    }
  }

  async getAllFeaturesStatus() {
    try {
        const featuresStatus = await this.featureRepository.findAllFeaturesStatus();
        if (featuresStatus.length === 0) {
            const notFoundError = new Error(`No features found`);
            notFoundError.statusCode = 404;
            throw notFoundError;
        }
        return featuresStatus;
    } catch (err) {
      throw err;
    }
  }

  async updateFeatureStatus(featureId, status, updator) {
    try {
        const fname = await this.featureRepository.updateFeatureStatus(featureId, status, updator);
        const keyExist = await redisClient.exists(`feature: ${fname}`);
        if (keyExist) {
            await redisClient.set(`feature: ${fname}`, status.toString());
        } else {
            await redisClient.setEx(`feature: ${fname}`, 60 * 60, status.toString());
        }
        return fname;
    } catch (err) {
        throw err;
    }
  }
}

export default FeatureService;
