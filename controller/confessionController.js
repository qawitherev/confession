const confessionQueries = require('../queries/confessionQueries')
const confessionTagQueries = require("../queries/confessionTagQueries");
const pool = require('../config/database');

const createConfession = async (req, res) => {
    const { userId, title, body, tagIds } = req.body; 
    if (!userId || !title || !body || !Array.isArray(tagIds)) {
        return res.status(400).send('Wrong parameter');
    }
    const connection = await pool.getConnection(); 
    try {
        await connection.beginTransaction(); 
        const [rows] = await connection.query(confessionQueries.createConfession, [userId, title, body]);
        const confessionId = rows.insertId; 
        const tagPromises = tagIds.map(tagId => {
            return connection.query(confessionTagQueries.createConfessionTag, [confessionId, tagId]);
        });
        await Promise.all(tagPromises);
        await connection.commit(); 
        res.status(200).json({ 
            success: true, 
            message: 'Confession created successfully',
            confessionId
         })
    } catch (err) {
        await connection.rollback();
        res.status(500).send(`Error executing query. Message: ${err.message}`);

    } finally {
        connection.release(); 
    }
};

const getConfessions = async (req, res) => {
    try {
        const [rows] = await pool.query(confessionQueries.getConfessions);
        res.status(200).json(rows);
    } catch(err) {
        res.status(500).send('Error executing query');
    }
}

const getConfessionById = async (req, res) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query(confessionQueries.getConfessionById, [id]);
        if (rows.length === 0) {
            return res.status(201).send(`No confession found with id ${id}`);
        }
        res.status(200).json(rows[0]);
    } catch(err) {
        res.status(500).send('Error executing query', err.name);
    }
};

const updateConfessionStatus = async (req, res) => {
    const { id, statusId } = req.body;
    if (!id || !statusId) {
        return res.status(400).send(`Both id and statusId is required`);
    }
    try {
        const [rows] = await pool.query(confessionQueries.getConfessionById, [id]);
        if(rows.length === 0) {
            return res.status(404).send(`Confession doesn't exist`);
        }
        await pool.query(confessionQueries.updateConfessionStatus, [statusId, id]);
        res.status(201).json({id, statusId});
    } catch(err) {
        res.status(500).send(`Error executing query. ${err.message}`);
    }
};

const getAllTags = async (req, res) => {
    try {
        const [tags] = await pool.query(confessionTagQueries.getAllTags);
        res.status(200).json({tags});
    } catch(err) {
        res.status(500).json({ err });
    }
}

const getPublishedConfessions = async (req, res) => {
    try {
        const [rows] = await pool.query(confessionQueries.getPublishedConfessions);
        res.status(200).json({
            success: true, 
            publishedConfessions: rows
        });
    } catch (err) {
        res.status(500).json({
            success: false, 
            message: err.message
        })
    }
};

const getPendingConfessions = async (req, res) => {
    try {
        const [confessions] = await pool.query(confessionQueries.getPendingConfessions);
        res.status(200).json({
            success: true,
            confessions
        });
    }catch(err) {
        res.status(500).json({err})
    }
};

const publishConfession = async (req, res) => {
    const { confessionId } = req.body;

    if (!confessionId) {
        return res.status(500).json({
            success: false, 
            message: `confession id is required`
        });
    }
    const { user } = req;
    console.info(`confessionController>publishConfession: ${user.id}`);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(confessionQueries.updateConfessionPublished, [confessionId]);
        const [rows] = await connection.query(confessionQueries.createPublishedTimestamp, [user.id, confessionId]);
        res.status(200).json({
            success: true, 
            message: `Confession with id: ${confessionId} published`,
            timestampId: rows.insertId
        });
        await connection.commit();
    } catch (err) {
        res.status(500).json({
            success: false, 
            message: err.message 
        });
    } finally {
        connection.release();
    }
}

const rejectConfession = async (req, res) => {
    const { confessionId } = req.body;
    if(!confessionId) {
        return res.status(500).json({
            success: false, 
            message: `confession id is required`
        });
    }
    const { user } = req; 
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(confessionQueries.updateConfessionRejected, [confessionId]);
        const [rows] = await connection.query(confessionQueries.createRejectedTimestamp, [user.id, confessionId]);
        res.status(200).json({
            success: true, 
            message: `Confession with id: ${confessionId} rejected`,
            timestampId: rows.insertId
        });
        await connection.commit();
    } catch (err) {
        res.status(500).json({
            success: false, 
            message: err.message
        })
    } finally {
        connection.release();
    }
}

const getPublishedConfessionAdmin = async (req, res) => {
    try {
        const [publishedConfessions] = await pool.query(confessionQueries.getPublishedConfessionAdmin);
        res.status(200).json({
            success: true, 
            publishedConfessions
        })
    } catch (err) {
        res.status(500).json({
            success: false, 
            message: err.message
        })
    }
}

const getRejectedConfessionAdmin = async (req, res) => {
    try {
        const [rejectedConfessions] = await pool.query(confessionQueries.getRejectedConfessionAdmin);
        res.status(200).json({
            success: true, 
            rejectedConfessions
        })
    } catch (err) {
        res.status(500).json({
            success: false, 
            message: err.message
        })
    }
}

//some utils 
const getPendingStatusId = async () => {
    const [rows] = await pool.query(`SELECT id FROM status WHERE label = 'Pending'`);
    return rows[0].id;
}

module.exports = {
    createConfession,
    getConfessions,
    getConfessionById,
    updateConfessionStatus,
    getAllTags, 
    getPublishedConfessions,
    getPendingConfessions, 
    publishConfession, 
    rejectConfession, 
    getPublishedConfessionAdmin, 
    getRejectedConfessionAdmin
};