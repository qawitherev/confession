/**
 * @author Abdul Qawi Bin Kamran
 * @version 0.0.4
 */

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async createUser(userTypeId, username, password, nickname) {
    try {
      const [result] = await this.pool.query(
        `
                INSERT INTO user (userTypeId, username, password, nickname, createdAt)
                VALUES (?, ?, ?, ?, NOW())
                `,
        [userTypeId, username, password, nickname]
      );
      return result.insertId;
    } catch (err) {
      throw err;
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
                INSERT INTO usertype (label, isActive)
                VALUES (?, 1)
                `,
        [userType]
      );
      const [_] = await connection.query(
        `
                INSERT INTO usertype (label, isActive)
                VALUES ('Admin', 1)
                `
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
                FROM usertype
                WHERE label = ? AND 
                isActive = 1
                `,
        [userType]
      );
      if (result.length === 0) {
        return null;
      }
      return result[0].id;
    } catch (err) {
      throw err;
    }
  }

  async getUserByUsernameAndPassword(username, hashedPassword) {
    try {
      const [result] = await this.pool.query(
        `
          SELECT u.id, ut.label as userType
          FROM user u
          join usertype ut on ut.id = u.userTypeId
          WHERE username = ? AND 
          password = ?

        `,
        [username, hashedPassword]
      );
      return result[0] || null;
    } catch (err) {
      throw err;
    }
  }

  async findAllUsersPaged(
    searchKeyword,
    userType,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page = 1,
    pageSize = 50
  ) {
    const offset = (page - 1) * pageSize;
    try {
      const [result] = await this.pool.query(
        `
        select u.id, ut.label as userType, u.username, u.nickname, u.createdAt from user u 
        inner join usertype ut on ut.id = u.userTypeId
        where (
        u.username like concat('%', ?, '%') or
        u.nickname like concat('%', ?, '%')
        ) and 
        u.userTypeId = (select id from usertype ut where ut.label = ?) and 
        u.createdAt between ? and ?
        order by ${sortBy} ${sortOrder}
        limit ? offset ?
        `,
        [
          searchKeyword,
          searchKeyword,
          userType,
          startDate,
          endDate,
          pageSize,
          offset,
        ]
      );
      const [res] = await this.pool.query(
        `
        select count(*) as total from user u 
        where (
        u.username like concat('%', ?, '%') or
        u.nickname like concat('%', ?, '%')
        ) and 
        u.userTypeId = (select id from usertype ut where ut.label = ?) and 
        u.createdAt between ? and ?
        `,
        [searchKeyword, searchKeyword, userType, startDate, endDate]
      );
      const count = res[0].total;
      return {
        users: result || [],
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
        },
      };
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
                join reactiontype rt on cr.reactiontypeId = rt.id
                where cr.reactorId = ?
                `,
        [userId]
      );
      return result || null;
    } catch (err) {
      throw err;
    }
  }

  //TODO: audit trail for this one
  /**
   * soft delete user by updating user.deletedAt = now()
   * @param {number} userId user id that is want to de deleted
   * @param {number} deletor user id that is deleting the user
   * @returns {Promise<void>}
   */
  async deleteUserById(userId, deletor) {
    const conn = await this.pool.getConnection();
    await conn.beginTransaction();
    try {
      //check if deletor is an admin
      const [isAdmin] = await conn.query(
        `
        select u.id from user u 
        where u.id = ? and u.userTypeId = (select id from usertype where usertype.label = 'Admin')
        `,
        [deletor]
      );
      // if an admin, can delete any user regardless usertype
      if (isAdmin.length > 0) {
        const [deleted] = await conn.query(
          `
            update user u 
            set u.deletedAt = now()
            where u.id = ?
            `,
          [userId]
        );
        await conn.commit();
        if (deleted.affectedRows === 0) {
          const err = new Error(`User not found`);
          err.statusCode = 404;
          throw err;
        }
      } else {
        // normal user can only delete their own account
        if (userId !== deletor) {
          const err = new Error(`User can only delete their own account`);
          err.statusCode = 403;
          throw err;
        }
        await conn.query(
          `
          update user u 
          set u.deletedAt = now()
          where u.id = ?
          `,
          [userId]
        );
        await conn.commit(); 
      }
    } catch (err) {
      await conn.rollback(); 
      throw err;
    } finally {
      conn.release();
    }
  }
}

export default UserRepository;
