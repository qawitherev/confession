class ResponseHandler {
    constructor() {
        this.timestamp = new Date().toISOString();
    }

    static success(message,statusCode = 200, data = null) {
        return {
            success: true, 
            message, 
            data, 
            statusCode, 
            timestamp: new Date().toISOString()
        };
    }

    static error(message, statusCode = 500, errors = null) {
        return {
            success: false, 
            message, 
            statusCode, 
            errors, 
            timestamp: new Date().toISOString()
        };
    }

    static validationError(errors) {
        return this.error(`Validation failed`, 400, errors);
    }

    static unauthorized(errors) {
        return this.error(`Unauthorized access`, 401, errors); 
    }
}

module.exports = ResponseHandler;