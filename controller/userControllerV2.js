const ResponseHandler = require("../controller/responseHandler");

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  signUp = async (req, res) => {
    const { username, nickname, hashedPassword } = req.body;

    if (!username || !nickname || !hashedPassword) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(
            `Username, nickname and password cannot be empty`,
            400
          ) 
        );
    }

    try {
      const user = await this.userService.signUp(
        username,
        hashedPassword,
        nickname
      );
      return res
        .status(200)
        .json(ResponseHandler.success(`Sign up success`, 200, user));
    } catch (err) {
      return res.status(err.statusCode).json(ResponseHandler.error(err.message, err.statusCode, err));
    }
  };

  login = async(req, res) => {
    const { username, hashedPassword } = req.body; 
    try {
        const loginUser = await this.userService.login(username, hashedPassword);
        return res.status(200).json(ResponseHandler.success(`Login success`, 200, loginUser))
    } catch (err) {
        if(err.statusCode === 401) {
          return res.status(err.statusCode).json(ResponseHandler.error(err.message, err.statusCode, err)); 
        }
        return res.status(500).json(ResponseHandler.error(err.message, 500, err))
    }
  }

  logout = async (req, res) => {
    const token = req.headers['authorization'];
    this.userService.logout(token);
    return res.status(200).json(ResponseHandler.success(`Logout success`, 200, null));
  }

  getUserReactions = async (req, res) => {
    const userId = req.user.id; 
    try {
      const reactions = await this.userService.getUserReactions(userId); 
      res.status(200).json(ResponseHandler.success(`User reactions queried`, 200, reactions)); 
    } catch (err) {
      res.status(200).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
    }
  }

  getAllUsersPaged = async (req, res) => {
    const { searchKeyword, startDate, endDate, sortBy, sortOrder, page, pageSize } = req.query; 
    try {
      const users = await this.userService.getAllUsersPaged(
        searchKeyword, 'User', startDate, endDate, sortBy, sortOrder, 
        page ? parseInt(page) : 1, 
        pageSize ? parseInt(pageSize) : 50
      );
      res.status(200).json(ResponseHandler.success(`Users data fetched`, 200, users));
    } catch (err) {
      res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message));
    }
  }

  deleteUser = async (req, res) => {
    const { userId, deletorId } = req.query;
    try {
      await this.userService.deleteUser(userId, deletorId);
      res.status(200).json(ResponseHandler.success(`User deleted`, 200, `User with id ${userId} has been deleted`));
    } catch (err) {
      const sc = err.statusCode || 500
      res.status(sc).json(ResponseHandler.error(`Something went wrong`, sc, err.message));
    }
  }
}

module.exports = UserController;
