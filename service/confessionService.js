/**
 * Service class for confession. Dependent on ConfessionRepository
 * @author Abdul Qawi Bin Kamran 
 * @version 0.0.1
 */

class ConfessionService {
    constructor(confessionRepository) {
        this.confessionRepository = confessionRepository;
    }

    /**
     * 
     * @param {string} title - title of the confession 
     * @param {string} body - body of the confession 
     * @param {Number} userId - User id of confessor
     * @param {Number[]} tagIds - Tag ids for confession
     * @returns {Promise<Number>} - Id of the newly created confession
     */
    async createConfession(title, body, userId, tagIds) {
        try {
            const newConfessionId = await this.confessionRepository.insertConfession(title, body, userId, tagIds);
            return newConfessionId;
        } catch (err) {
            throw(err);
        }
    }
}

module.exports = ConfessionService;