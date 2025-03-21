/*
    file to turn in the server using the config 
    created in config/database.js
*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const routerV2 = require('./routes/routerV2');
const pool = require('./config/database');
const { swaggerUI, swaggerSpec } = require('./routes/swagger');
const redisClient = require('./config/redis');

const app = express(); 
const PORT = process.env.PORT || 3000;

// Verify database connection
async function verifyConnection() {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('Database connected successfully:', rows);
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

//TODO: implement this function
async function initStaticData() {
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
    } catch (err) {
        await connection.rollback();
        console.error('Error initializing static data:', err);
    } finally {
        await connection.release();
    }
    
    /**
     * this function is used to initialize static data in the database.
     * data is stored inside constants.js
     * involved tables
     * - status
     * - reactiontype
     * - usertype
     * - timestamptype
     */
}

async function verifyRedis() {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }   
}

verifyConnection();
verifyRedis();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/api/user', routerV2.userRouter);
app.use('/api/confession', routerV2.confessionRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); 
}); 

