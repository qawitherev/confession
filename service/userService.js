const JWToken = require('../security/jsonWebToken'); // Adjust the path as necessary

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository; 
    }

    async signUp(username, hashedPassword, nickname) {
        try {
            const existingUser = await this.userRepository.getUserByUsername(username); 
            if(existingUser) {
                const err  = new Error(`User with username ${username} already exist`)
                err.statusCode = 409;
                throw err;
            }

            let userTypeId = await this.userRepository.getUserTypeId('User');
            if (!userTypeId) {
                userTypeId = await this.userRepository.createUserType('User');
            }

            const newUserId = await this.userRepository.createUser(userTypeId, username, hashedPassword, nickname);
            return {
                userId: newUserId, 
                username: username
            };
        } catch (err) {
            throw err; 
        }
    }

    async login(username, hashedPassword) {
        try {
            const loginUser = await this.userRepository.getUserByUsernameAndPassword(username, hashedPassword); 
            if (!loginUser) {
                const error = new Error('Invalid username or password');
                error.statusCode = 401; 
                throw error; 
            }
            const { id } = loginUser;
            const userForToken = {id: id, username: username}
            const token = JWToken.generateToken(userForToken);
            return {
                userId: id, 
                username, 
                token
            };
        } catch (err) {
            throw err;
        }
    }

    async logout(token) {
        JWToken.blacklistToken(token, 3600); 
        return true; 
    }

    async getUserReactions(userId) {
        try {
            const reactions = await this.userRepository.findUserReactions(userId); 
            return reactions; 
        } catch (err) {
            throw err; 
        }
    }
}

module.exports = UserService;