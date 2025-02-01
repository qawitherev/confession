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
            res.status(200).json(ResponseHandler.success(`Confession submitted`, 200, confessionId))
        } catch (err) {
            res.status(500).json(ResponseHandler.error(err.message, 500, err));
        }
    }

    getAllTags = async(_, res) => {
        try {
            const allTags = await this.confessionService.getAllTags();
            res.status(200).json(ResponseHandler.success(`All tags retrieved`, 200, allTags));
        } catch (err) {
            res.status(400).json(ResponseHandler.error(`Something went wrong`, 500, err.message));
        }
    }

    getPendingConfessions = async(_, res) => {
        try {
            const pendingConfessions = await this.confessionService.getPendingConfessions(); 
            res.status(200).json(ResponseHandler.success(`Pending confessions queried`, 200, pendingConfessions)); 
        } catch (err) {
            res.status(500).json(ResponseHandler.error(`Something went wrong. ${err.message}`, 500, err));
        }
    }

    getRejectedConfessions = async(_, res) => {
        try {
            const rejectedConfessions = await this.confessionService.getRejectedConfessions(); 
            res.status(200).json(ResponseHandler.success(`Rejected confession queried`, 200, rejectedConfessions)); 
        } catch (err) {
            res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
        }
    }

    getPublishedConfessions = async(_, res) => {
        try {
            const publishedConfessions = await this.confessionService.getPublishedConfessions(); 
            res.status(200).json(ResponseHandler.success(`Published confessions queried`, 200, publishedConfessions)); 
        } catch (err) {
            res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
        }
    }

    publishConfession = async (req, res) => {
        const { id } = req.user; 
        const { confessionId } = req.body;
        try {
            await this.confessionService.publishConfession(id, confessionId);
            res.status(200).json(ResponseHandler.success(`Confession published`, 200, `Confession published by admin`)); 
        } catch (err) {
            res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
        }
    }

    rejectConfession = async (req, res) => {
        const { id } = req.user; 
        const { confessionId } = req.body;
        try {
            await this.confessionService.rejectConfession(id, confessionId);
            res.status(200).json(ResponseHandler.success(`Confession rejected`, 200, `Confession rejected by admin`)); 
        } catch (err) {
            res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
        }
    }

    reactConfession = async (req, res) => {
        const { confessionId, reaction } = req.body; 
        const { id } = req.user;
        const reactorId = id;  

        try {
            const result = await this.confessionService.reactConfession(confessionId, reactorId, reaction);
            res.status(200).json(ResponseHandler.success(`React success`, 200, result)); 
        } catch (err) {
            res.status(500).json(ResponseHandler.error(`Something went wrong`, 500, err.message)); 
        }
    }

    getConfessions = async (req, res) => {
        const userId = req.user.id; 
        try {
            const confessions = await this.confessionService.getConfessions(userId); 
            res.status(200).json(ResponseHandler.success(`Confessions queried`, 200, confessions)); 
        } catch (err) {
            res.status(200).json(ResponseHandler.error(`Something went wrong`, 500, err.message));
        }
    }
}

module.exports = ConfessionController;