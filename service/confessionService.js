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

    async getAllTags() {
        try {
            const allTags = await this.confessionRepository.findAllTags();
            return allTags;
        } catch (err) {
            throw err; 
        }
    }

    async getPendingConfessions() {
        try {
            const pendingConfessions = await this.confessionRepository.findPendingConfessions(); 
            return pendingConfessions; 
        } catch (err) {
            throw err; 
        }
    }

    async getRejectedConfessions() {
        try {
            const rejectedConfessions = await this.confessionRepository.findPublishedOrRejectedConfessions('Rejected'); 
            return rejectedConfessions; 
        } catch (err) {
            throw err; 
        }
    }

    async getPublishedConfessions() {
        try {
            const publishedConfessions = await this.confessionRepository.findPublishedOrRejectedConfessions('Published'); 
            return publishedConfessions; 
        } catch (err) {
            throw err; 
        }
    }

    async publishConfession(userId, confessionId) {
        try {
            await this.confessionRepository.updateConfessionStatus(userId, confessionId, 'Published', 'Published'); 
        } catch (err) {
            throw err; 
        }
    }

    async rejectConfession(userId, confessionId) {
        try {
            await this.confessionRepository.updateConfessionStatus(userId, confessionId, 'Rejected', 'Rejected'); 
        } catch (err) {
            throw err; 
        }
    }

    async reactConfession(confessionId, reactorId, reaction) {
        try {
            const res = await this.confessionRepository.reactConfession(confessionId, reactorId, reaction);
            return res; 
        } catch (err) {
            throw err; 
        }
    }

    async getConfessions(userId) {
        try {
            const confessions = await this.confessionRepository.findConfessions(userId); 
            return confessions; 
        } catch (err) {
            throw err; 
        }
    }

    async getConfessionsForUser(status, userId) {
        try {
            if (status === 'Published') {
                const confessions = await this.confessionRepository.findPublishedConfessionsForUser(userId); 
                return confessions; 
            } else {
                const confessions = await this.confessionRepository.findConfessionsForUser(status, userId); 
                return confessions; 
            }
        } catch (err) { 
            throw err; 
        }
    }

    async deleteConfession(userId, confessionId) {
        try {
            return await this.confessionRepository.deleteConfession(userId, confessionId); 
        } catch (err) {
            throw err; 
        }
    }

}

module.exports = ConfessionService;