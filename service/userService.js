import JWToken from '../security/jsonWebToken.js';
import { isValidDate } from '../utils/dateAndTime.js';

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
            const { id, userType } = loginUser;
            const userForToken = {id: id, username: username}
            const token = JWToken.generateToken(userForToken);
            return {
                username, 
                userType,
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

    async getAllUsersPaged(
        searchKeyword, 
        userType, 
        startDate, 
        endDate, 
        sortBy, 
        sortOrder,
        page, 
        pageSize) {

        const availableSortBy = ['u.id', 'u.username', 'u.nickname', 'u.createdAt'];
        const availableSortOrder = ['asc', 'desc'];

        const sd = isValidDate(startDate) && startDate ? startDate : '1900-01-01';
        const ed = isValidDate(endDate) && endDate ? endDate : '9999-12-31';
        const ut = !userType ? 'User' : userType;  
        const sk = !searchKeyword ? '' : searchKeyword; 
        const sb = availableSortBy.includes(sortBy) ? sortBy : 'u.id';
        const so = availableSortOrder.includes(sortOrder) ? sortOrder : 'asc'

        try {
            const users = await this.userRepository.findAllUsersPaged(
                sk, 
                ut, 
                sd, ed,
                sb, so,
                page, pageSize); 
            return users; 
        } catch (err) {
            throw err; 
        }
    }

    async deleteUser(userId, deletor) {
        try {
            await this.userRepository.deleteUserById(userId, deletor);
        } catch (err) {
            throw err; 
        }
    }
}

export default UserService;