/**
 * @deprecated
 */
const confessionTagQueries = {
    getAllTags: `SELECT id, label FROM tag 
WHERE isActive = 1`,
    createConfessionTag: `INSERT INTO confessionTag (confessionId, confessionTagId)
VALUES 
(?, ?);`
};

module.exports = confessionTagQueries;