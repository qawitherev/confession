const ResponseHandler = require("./responseHandler");

class ConfessionController {
    constructor(confessionService) {
        this.confessionService = confessionService;
    }

    /**
     * 
     * using this so that context is not forgotten when in callback 
     */
    createConfession = async (req, res) => {

        const { title, body, tagIds } = req.body;
        const { id } = req.user;

        if(!title || !body || !tagIds || !id) {
            return res.status(500).json(ResponseHandler.error(`Title, body, tagIds and user ID cannot be empty`, 500, null));
        }

        try {
            const confessionId = await this.confessionService.createConfession(title, body, id, tagIds);
            res.status(200).json(ResponseHandler.success(`Confession created`, 200, confessionId))
        } catch (err) {
            res.status(500).json(ResponseHandler.error(err.message, 500, err));
        }
    }

    getAllTags = async(req, res) => {
        try {
            const allTags = await this.confessionService.getAllTags();
            res.status(200).json(ResponseHandler.success(`All tags retrieved`, 200, allTags));
        } catch (err) {
            res.status(400).json(ResponseHandler.error(`Something went wrong`, 500, err.message));
        }
    }
}

module.exports = ConfessionController;