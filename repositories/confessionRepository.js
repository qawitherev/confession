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
     * @returns {Promise<Array<{confessionId: number, username: string, title: string, body: string, submittedOn: DateTime, tags: string}>>} Confessions with status pending 
     */
    async findPendingConfessions() {
        try {
            const [result] = await this.pool.query(
                `select c.id confessionId, u.username, c.title, c.body,  c.createdAt as submittedOn, group_concat(t.label separator ', ') as tags
                from confession c 
                join status s on c.statusId = s.id
                join user u on c.userId = u.id
                join confessiontag ct on ct.confessionId = c.id
                join tag t on t.id = ct.confessionTagId
                where s.label='Pending'
                group by c.id, u.username, c.title, c.body,  c.createdAt 
                order by c.id desc`
            ); 
            return [result] || null;
        } catch (err) {
            throw err; 
        }
    }

    /**
     * 
     * @param {string} status it's either Published or Rejected, no other values awasssss
     * @returns 
     */
    async findPublishedOrRejectedConfessions(status) {
        try {
            const [result] = await this.pool.query(
                `
                select confessor.username as username, c.title, c.body, group_concat(t.label separator ', ') as tags, 
                c.createdAt as submittedOn, executor.username as rejectedBy, cts.executedAt as rejectedAt from confession c
                left join confessiontag ct on ct.confessionId = c.id
                left join tag t on t.id = ct.confessionTagId
                inner join confesssionTimestamp cts on cts.confessionId = c.id
                left join timestamptype ty on ty.id = cts.timestampTypeId
                left join user confessor on c.userId = confessor.Id
                left join user executor on cts.userId = executor.Id
                where ty.label = ?
                group by c.id, confessor.username, c.title, c.body, c.createdAt, executor.username, cts.executedAt
                order by c.id desc
                `, 
                [status]
            );
            return [result] || null;
        } catch (err) {
            throw err; 
        }
    }

    /**
     * 
     * @param {number} confessionId confession id to be updated 
     * @param {string} status Published/Rejected
     */
    async updateConfessionStatus(userId, confessionId, status, timestampType) {
        const connection = await this.pool.getConnection(); 
        await connection.beginTransaction(); 
        try {
            await this._updateConfessionStatus(connection, confessionId, status); 
            await this._insertTimestamp(connection, userId, confessionId, timestampType); 
            await connection.commit(); 
        } catch (err) {
            await connection.rollback(); 
            throw err; 
        } finally {
            connection.release(); 
        }
    }

    async reactConfession(confessionId, reactorId, reaction) {
        try {
            const [result] = await this.pool.query(
                `
                insert into confessionReaction (confessionId, reactorId, reactionTypeId, reactionTimestamp)
                value 
                (?, ?, (select id from reactionType r where r.label=?), now())
                `, 
                [confessionId, reactorId, reaction]
            ); 
            return result.insertId;
        } catch (err) {
            throw err; 
        }
    }

    /**
     * this query is for confession page (user side)
     */
    async findConfessions(userId) {
        try {
            const [result] = await this.pool.query(
                `
                with confessiontags as (
                select c.id as confessionId, group_concat(t.label separator ', ') as tags
                from confession c
                inner join confessiontag ct on ct.confessionId = c.id 
                left join tag t on t.id = ct.confessiontagId
                group by c.id
                ), 
                userreaction as (
                    select cr.confessionId as confessionId, rt.label as reaction
                    from confessionreaction cr 
                    join reactiontype rt on rt.id = cr.reactionTypeid
                    where cr.reactorId = ?
                    order by cr.reactiontimestamp desc
                )
                select 
                c.id as confessionId, c.title, c.body, c.createdAt as submittedOn, ct.tags as tags,
                sum(case when rt.label = 'Relate' then 1 else 0 end) as relateCount, 
                sum(case when rt.label = 'Not Relate' then 1 else 0 end) as notRelateCount,
                ur.reaction as reaction
                from confession c
                left join confessionreaction cr on cr.confessionId = c.id
                left join reactiontype rt on rt.id = cr.reactiontypeId
                inner join confessiontags ct on ct.confessionId = c.id
                left join userreaction ur on ur.confessionId = c.id
                group by c.id, c.title, c.body, c.createdAt, ct.confessionId
                order by c.id desc 
                `, 
                [userId]
            ); 
            return result; 
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

    async _updateConfessionStatus(connection, confessionId, status) {
        try {
            await connection.query(
                `
                update confession c
                set statusId = (select id from status s where s.label = ?)
                where c.id = ?; 
                `, 
                [status, confessionId]
            )
        } catch (err) {
            throw err; 
        }
    }

    async _insertTimestamp(connection, userId, confessionId, timestampType) {
        try {
            await connection.query(
                `
                insert into confesssionTimestamp (userId, confessionId, timestamptypeId, executedAt) 
                values 
                (?, ?, (select id from timestampType a where a.label = ?), now());
                `, 
                [userId, confessionId, timestampType]
            ); 
        } catch (err) {
            throw err; 
        }
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