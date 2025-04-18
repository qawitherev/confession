//DEPRECATED: This file is deprecated and will be removed in future versions. Please use the new version of the API instead.

import swaggerJSDocs from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0', // Specifies the OpenAPI version
        info: {
            title: 'Confession-API', // The title of your API
            version: '0.1.0', // The version of your API
            description: 'Early version of Confession-API. Not use-ready', // A brief description of your API
        },
    },
    apis: ['./routes/routerV2.js'], // Path to the files containing API documentation
};

const swaggerSpec = swaggerJSDocs(options); 

export {
    swaggerUI, 
    swaggerSpec
}