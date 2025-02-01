/**
 * @author Abdul Qawi Bin Kamran
 * @version 0.0.3
 */

const pool = require("../config/database");
const userQueries = require("../queries/userQueries");

class UserTypeAuth {
  /**
   *
   * @param {number} userId
   * @returns {boolean} true is admin and false if otherwise
   */
  static async isAdmin(userId) {
    try {
      const [result] = await pool.query(
        `select u.username from user u 
        join usertype ut on u.userTypeId = ut.id
        where u.id = ? and ut.label = 'Admin'`,
        userId
      );
      if(result.length === 0) {
        return false; 
      } else {
        return true;
      }
    } catch (err) {
      throw err;
    }
  }

  static async isUser(userId) {
    try {
      const [result] = await pool.query(
        `select u.username from user u 
        join usertype ut on u.userTypeId = ut.id
        where u.id = ? and ut.label = 'User'`,
        userId
      );
      if(result.length === 0) {
        return false; 
      } else {
        return true;
      }
    } catch (err) {
      throw err;
    }
  }
}


//deprecated
const checkAdmin = async (req, res, next) => {
  const { user } = req;
  try {
    const [rows] = await pool.query(userQueries.getUserById, [user.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else if (rows[0].label !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  checkAdmin,
  UserTypeAuth
};
