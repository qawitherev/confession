/**
 * Repository class to handle database operation 
 * for the table {Confession}, {ConfessionTag} {ConfessionTimestamp}, 
 * @author Abdul Qawi Bin Kamran
 * @version 0.0.1
 */


class ConfessionRepository{
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * 
     * @param {string} title - Title of the confession
     * @param {string} body - Body of the confession
     * @param {string[]} tags - Tag IDs of the confession
     * @param {number} userId - User ID of the confessor
     * @param {pendingStatusId} - Pending status ID from status table 
     * @returns {Promise<number>} - ID of the created confession
     * @throws {Error} - Throw when database operation fails
     */
    async insertConfession(title, body, userId, tagIds) {
        //TODO: To add validation for each data length 
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        try {
           const pendingStatusId = await this._findStatusId(connection, 'Pending');
           if (!pendingStatusId) {
            throw new Error('Status table not yet initialized');
           }
           const newConfessionId = await this._insertConfessionBase(connection, title, body, userId, pendingStatusId)
           await this._insertConfessionTags(connection, newConfessionId, tagIds);
           await connection.commit()
           return newConfessionId
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
    
    /**
     * 
     * @returns {Promise<Array<{id: number, label: string}>>} Array of tag Ids and its label
     */
    async findAllTags() {
        try {
            const [result] = await this.pool.query(
                `
                SELECT id, label FROM tag
                WHERE isActive = 1
                `
            ); 
            return [result] || null;
        } catch (err) {
            throw err; 
        }
    }

    /**
     * utilities subqueries 👇🏼
     */

    /**
     * @param {string} label - The label that we want to query for
     * @returns {Promise<number>} - The pending status ID from status table
     */
    async _findStatusId(connection, label) {
        const [result] = await connection.query(
            `
            SELECT id from status 
            WHERE label = ? and 
            isActive = 1
            `, 
            [label]
        ); 
        //TODO: handle when Pending is not yet created 
        return result[0].id || null;
    }

    /**
     * @returns {Promise<number>} - Newly inserted confession ID 
     */
    async _insertConfessionBase(connection, title, body, userId, pendingStatusId) {
        const [result] = await connection.query(
            `
            INSERT INTO confession (userId, title, body, statusId, createdAt)
            VALUES 
            (?, ?, ?, ?, NOW())
            `, 
            [userId, title, body, pendingStatusId]
        );
        return result.insertId;
    }

    async _insertConfessionTags(connection, confessionId, tagIds) {
        //TODO: To check whether the tags with that id exist
        const [result] = await connection.query(
            `
            SELECT id from tag 
            WHERE id IN (?)
            `, 
            [tagIds]
        ); 
        if(tagIds.length !== result.length) {
            throw new Error(`One or more tags does not exist`);
        }
        const newArray = tagIds.map(tagId=> [confessionId, tagId]);
        await connection.query(
            `
            INSERT INTO confessiontag (confessionId, confessionTagId)
            VALUES ?
            `, 
            [newArray]
        );
    }
}

module.exports = ConfessionRepository;

/*
    repo naming convention 
    - insertX: to insert data into db 
    - findX: to find data from db 
    - updateX
    - deleteX

    service naming convention 
    - createX
    - getX
    - updateX
    - deleteX
    - processX: for long complicated process 
*/