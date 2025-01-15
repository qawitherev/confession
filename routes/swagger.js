const swaggerJSDocs = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0', // Specifies the OpenAPI version
        info: {
            title: 'Confession-API', // The title of your API
            version: '0.0.1', // The version of your API
            description: 'Early version of Confession-API. Not use-ready', // A brief description of your API
        },
    },
    apis: ['./routes/*.js'], // Path to the files containing API documentation
};

const swaggerSpec = swaggerJSDocs(options); 

module.exports = {
    swaggerUI, 
    swaggerSpec
}