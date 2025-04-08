/*
    file to turn in the server using the config 
    created in config/database.js
*/

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routerV2 from './routes/routerV2.js';
import pool from './config/database.js';
import { swaggerUI, swaggerSpec } from './routes/swagger.js';
import redisClient from './config/redis.js';
import StaticDataInit from './repositories/staticDataRepository.js';

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

async function initStaticData() {
    try {
        const dataInit = new StaticDataInit(pool);
        await dataInit.initializeStaticData();
    } catch (err) {
        console.error('Error initializing static data:', err);
    } 
    
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
initStaticData();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/api/user', routerV2.userRouter);
app.use('/api/confession', routerV2.confessionRouter);
app.use('/api/feature', routerV2.featureRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); 
});

