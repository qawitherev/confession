/**
 * FeatureRepository.js
 * This file contains the FeatureRepository class, which is responsible for 
 * interacting with the database to perform CRUD operations on the Feature model.
 * 
 * @author Abdul Qawi Bin Kamran 
 * @version 0.0.1
 */

const redisClient = require("../config/redis");


class FeatureRepository {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * get status of a feature
     * @param {string} feature - name of feature 
     * @returns {Promise<boolean>} - true if feature is enabled, false otherwise
     */
    async findFeatureStatus(feature) {
        try {
            const [res] = await this.pool.query(
                `
                select f.name, f.isActive from feature f 
                where f.name = ?
                limit 1
                `, 
                [feature]
            );
            return res; 
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @returns {Promise<Array>} - array of all features and their status
     * @description - this method returns all features and their status
     */
    async findAllFeaturesStatus() {
        try {
            const [res] = await this.pool.query(
                `
                select f.id, f.name, f.isActive from feature f 
                order by f.name asc 
                `, 
                []
            );
            return res; 
        } catch (err) {
            throw err; 
        }
    }

    //TODO: audit trail for this one 
    async updateFeatureStatus(featureId, status, updator) {
        try {
            const [res] = await this.pool.query(
                `
                update feature f
                set f.isActive = ?, f.updatedAt = now(), f.updatedBy = ?
                where f.id = ?
                `, 
                [status, updator, featureId]
            ); 
            const [fname] = await this.pool.query(
                `
                select f.name from feature f 
                where f.id = ?
                `, 
                [featureId]
            );
            if (res.affectedRows === 0) {
                const notFoundError = new Error(`Feature with id ${featureId} not found`);
                notFoundError.statusCode = 404;
                throw notFoundError;
            } 
            return fname[0].name; 
        } catch (err) {
            throw err;
        }
    }
}

module.exports = FeatureRepository;