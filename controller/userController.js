/*
    crud controller for table user 
*/

const pool = require('../config/database'); 
const userQueries = require('../queries/userQueries');
const { generateToken, verifyToken, blacklistToken} = require('../security/jsonWebToken');


const signUp =  async (req, res) => {
    const { username, nickname, hashedPassword } = req.body;
    let userTypeId = 0;
    if (!username || !hashedPassword || !nickname) {
        return res.status(400).send('Username, password and nickname cannot be empty')
    }

    const connection = await pool.getConnection();

    try {
        const [userExist] = await connection.query(userQueries.getUserByUsername, [username]);
        if(userExist.length > 0) {
            connection.release();
            return res.status(200).json({
                success: false,
                message: `Username ${username} already exists`
            });
        }
        const [userTypeUserId] = await connection.query(userQueries.getUserTypeUserId); 
        if(userTypeUserId.length === 0) {
            connection.release();
            const [rows] = await connection.query(userQueries.createUserUserType);
            userTypeId = rows.insertId;
        }else {
            userTypeId = userTypeUserId[0].id;
        }
        const [newUser] = await connection.query(userQueries.createUser, [userTypeId, username, hashedPassword, nickname]);
        res.status(201).json({
            success: true, 
            user: {
                id: newUser.insertId,
                username,
                nickname
            }
        });
    } catch (err) {
        console.info(err);
        res.status(500).send('Error executing query');
    }
}

const updateUserById = async (req, res) => {
    const { id, nickname } = req.body; 
    if (!id || !nickname) {
        return res.status(400).send(`Both id and nickname is required`);
    }
    try {
        const [rows] = await pool.query(userQueries.getUserById, [id]);
        if(rows.length === 0) {
            return res.status(404).send(`User doesn't exist`);
        }
        await pool.query(userQueries.updateUserById, [nickname, id]);
        res.status(201).json({id, nickname});
    } catch(err) {
        res.status(500).send(`Error executing query. ${err.message}`);
    }
}

const getAllUser = async (req, res) => {
    const query = "SELECT * FROM `User`";

    try {
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (err) {
        // console.error('Error executing query', err);
        res.status(500).send('Error executing query');
    }
};

const getUserById = async (req, res) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query(userQueries.getUserById, [id]);
        if (rows.length === 0) {
            return res.status(201).send(`No user found with id ${id}`);
        }
        res.status(200).json(rows[0]);
    } catch(err) {
        res.status(500).send('Error executing query', err.name);
    }
}

const deleteUserById = async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).send(`Missing id parameter`);
    }
    try {
        const [rows] = await pool.query(userQueries.getUserById, [id]);
        if(rows.length === 0) {
            return res.status(404).send(`User with id ${id} not found`);
        }
        await pool.query(userQueries.deleteUserById, [id]);
        res.status(201).json({id, status: 'Deleted'});
    } catch(err) {
        res.status(500).send(`Error executing query. ${err.message}`);
    }
}

const login = async (req, res) => {
    const { username, hashedPassword } = req.body;
    if (!username || !hashedPassword) {
        return res.status(500).send(`Username and password are required`);
    }
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(userQueries.getUserByUsername, [username]);
        if(rows.length === 0) {
            connection.release();
            return res.status(200).json({
                success: false,
                message: `User not found`
            });
        }
        const [data] = await connection.query(userQueries.getUserByUsernameAndPassword, [username, hashedPassword]);
        if(data.length === 0) {
            connection.release();
            return res.status(200).json({
                success: false,
                message: `Password is incorrect`
            });
        }
        const user = {
            id: data[0].id,
            username: data[0].username
        };
        const token = generateToken(user);
        res.status(200).json({
            success: true,
            message: `Login successful`,
            user: {
                id: data[0].id,
                username: data[0].username,
                token
            }
        });
    }catch (err) {
        connection.release();
        res.status(500).json({error: `Error`, message: err.message});
    }finally {
        connection.release();
    }
};

const logout = async (req, res) => {
    const token = req.headers['authorization'];
    blacklistToken(token, 3600);
    res.status(200).json({
        success: true,
        message: `Logout successful`
    });
};


module.exports = {
    signUp,
    getAllUser, 
    getUserById,
    updateUserById,
    deleteUserById, 
    login,
    logout
}
