/**
 * @author Abdul Qawi Bin Kamran 
 * @version 0.0.1s
 */

const { default: rateLimit } = require("express-rate-limit");
const { default: ResponseHandler } = require("../controller/responseHandler");
const { LIMIT_GENERAL, WINDOW_MINUTES, LIMIT_AUTH, LIMIT_READ, LIMIT_WRITE } = require("../utils/constants");


//TODO; to add into redis
class RateLimitMW {
    /**
     * rate limiter middleware function
     * @param {number} maxRequests - maximum number of requests allowed in the time window
     * @param {number} windowMinutes - time window in milliseconds
     * @param {message} message - message to be sent when rate limit is exceeded
     */
    static rateLimiter(maxRequests, windowMinutes, message) {
        return rateLimit({
            windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
            max: maxRequests, // Limit each IP to maxRequests per windowMs
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            handler: (req, res) => {
                res.status(429).json(
                    ResponseHandler.error(
                        message || "Too many requests, please try again later",
                        429,
                        null
                    )
                );
            }
        })
    }

    //general rate limiter for all routes
    static generalLimiter = RateLimitMW.rateLimiter(LIMIT_GENERAL, WINDOW_MINUTES, "Too many requests, please try again later");

    //rate limiter for auth routes
    static authLimiter = RateLimitMW.rateLimiter(LIMIT_AUTH, WINDOW_MINUTES, "Too many authentication requests, please try again later");

    //rate limiter for read routes
    static readLimiter = RateLimitMW.rateLimiter(LIMIT_READ, WINDOW_MINUTES, "Too many read requests, please try again later");

    //rate limiter for write routes
    static writeLimiter = RateLimitMW.rateLimiter(LIMIT_WRITE, WINDOW_MINUTES, "Too many write requests, please try again later");
}

export default RateLimitMW;