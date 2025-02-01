/**
 * @author Abdul Qawi Bin Kamran 
 * @version 0.0.2
 */

class UserRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async createUser(userTypeId, username, password, nickname) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                `
                INSERT INTO user (userTypeId, username, password, nickname, createdAt)
                VALUES (?, ?, ?, ?, NOW())
                `, 
                [userTypeId, username, password, nickname]
            ); 
            await connection.commit();
            return result.insertId;
        } catch (err) { 
            await connection.rollback();
            throw err; 
        } finally {
            connection.release();
        }
    }

    async getUserByUsername(username) {
        try {
            const [user] = await this.pool.query(
                `
                SELECT id, username 
                FROM user 
                WHERE username = ?
                `, 
                [username]
            );
            return user[0] || null;
        } catch {
            throw err; 
        }
    }

    async createUserType(userType) {
        const connection = await this.pool.getConnection(); 

        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                `
                INSERT INTO userType (label, isActive)
                VALUES (?, 1)
                `, 
                [userType]
            ); 
            return result.insertId; 
        } catch (err) {
            throw err; 
        }
    }

    async getUserTypeId(userType) {
        try {
            const [result] = await this.pool.query(
                `
                SELECT id 
                FROM userType
                WHERE label = ? AND 
                isActive = 1
                `, 
                [userType]
            );
            return result[0].id || null;
        } catch (err) {
            throw err; 
        }
    }

    async getUserByUsernameAndPassword(username, hashedPassword) {
        try {
            const [result] = await this.pool.query(
                `
                SELECT id, username, password 
                FROM user 
                WHERE username = ? AND 
                password = ?
                `, 
                [username, hashedPassword]
            )
            return result[0] || null;
        } catch (err) {
            throw err; 
        }
    }

    /**
     * 
     * @param {number} userId 
     * @returns confession | reaction 
     */
    async findUserReactions(userId) {
        try {
            const [result] = await this.pool.query(
                `
                select cr.confessionId as confessionId, rt.label as reaction
                from confessionreaction cr 
                join reactionType rt on cr.reactionTypeId = rt.id
                where cr.reactorId = ?
                `, 
                [userId]
            )
            return result || null;
        } catch (err) {
            throw err; 
        }
    }
}

module.exports = UserRepository;