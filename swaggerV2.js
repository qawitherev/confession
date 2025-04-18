/**
 * @description swagger entry point, loads swagger.yaml file and serves it at /api-docs
 * @author Abdul Qawi Bin Kamran
 * @version 0.0.5
 */

import YAML from "yaml";
import swaggerUI from 'swagger-ui-express';
import fs from 'fs';

const swaggerSpec = YAML.parse(fs.readFileSync('./docs/swagger/swagger.yaml', 'utf8'));

export {
    swaggerUI, 
    swaggerSpec
}