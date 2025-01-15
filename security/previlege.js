const pool = require("../config/database");
const userQueries = require("../queries/userQueries");

const checkAdmin = async (req, res, next) => {
    const { user } = req;
    try {
        const [rows] = await pool.query(userQueries.getUserById, [user.id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false, 
                message: "User not found"
            });
        } else if ( rows[0].label !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    } 
};

module.exports = {
    checkAdmin
};