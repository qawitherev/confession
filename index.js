/**
 * @file index.js
 * @description Main entry point for the application. Sets up the server, database connection, and routes.
 * @requires express - A web framework for Node.js.
 * @author Abdul Qawi Bin Kamran 
 * @version 0.0.5
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { userRouter, confessionRouter, featureRouter} from './routes/routerV2.js';
import pool from './config/database.js';
import { swaggerUI, swaggerSpec } from './routes/swagger.js';
import redisClient from './config/redis.js';
import StaticDataInit from './repositories/staticDataRepository.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 3000;
const PORT_HTTPS = process.env.PORT_HTTPS || 3443;
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

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
app.use('/api/user', userRouter);
app.use('/api/confession', confessionRouter);
app.use('/api/feature', featureRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//start HTTP server on port 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); 
});

//start HTTPS server on port 3443
// ONLY USE THIS WHEN WE DON'T HAVE A REVERSE PROXY IN FRONT OF THE SERVER
// Uncomment the following lines to enable HTTPS server
// try {
//     const options = {
//         key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
//         cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
//     }; 
//     https.createServer(options, app).listen(PORT_HTTPS, () => {
//         console.log(`HTTPS Server running on port ${PORT_HTTPS}`);
//     });
// } catch (err) {
//     console.error('Error starting HTTPS server:', err);
// }

