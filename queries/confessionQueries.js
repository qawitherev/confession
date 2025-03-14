const confessionQueries = {
  createConfession: `INSERT INTO confession (userId, title, body, statusId, createdAt)
                        VALUES  
                        (?, ?, ?, (SELECT id from status where label = 'Pending'), NOW())`,
  getConfessions: `SELECT * FROM confessions`,
  getConfessionById: `SELECT * FROM confessions WHERE id = ?`,
  updateConfessionStatus: `UPDATE confessions SET statusId = ? WHERE id = ?`,
  deleteConfession: `DELETE FROM confessions WHERE id = ?`,
  getPublishedConfessions: `select 
user.username,
confession.title, 
confession.body, 
confession.createdAt,
group_concat(tag.label separator ', ') as tags
from confession 
left join user on confession.userId = user.id
left join status on confession.statusId = status.id
left join confessiontag on confession.id = confessiontag.confessionId
left join tag on confessiontag.confessionTagId = tag.id
where status.label = 'Published'
group by 
user.username,
confession.title, 
confession.body, 
confession.createdAt
`,
  getPendingConfessions: `SELECT 
    user.id AS userId, 
    user.username,
    confession.id AS confessionId,
    confession.title, 
    confession.body,
    GROUP_CONCAT(tag.label SEPARATOR ', ') AS tags
FROM user 
INNER JOIN confession ON 
    user.id = confession.userId
LEFT JOIN confessiontag ON
    confession.id = confessiontag.confessionId
LEFT JOIN tag ON 
    tag.id = confessiontag.confessiontagId
LEFT JOIN status ON 
    confession.statusId = status.id
WHERE 
    status.label = 'Pending'
GROUP BY 
    user.id, 
    user.username,
    confession.id, 
    confession.title,
    confession.body`,
    updateConfessionPublished: `UPDATE confession
SET statusId = (SELECT id FROM status WHERE label = 'Published')
WHERE confession.id = ?`, 
    updateConfessionRejected: `UPDATE confession
SET statusId = (SELECT id FROM status WHERE label = 'Rejected')
WHERE confession.id = ?`,
    createPublishedTimestamp: `INSERT INTO confesssiontimestamp (userId, confessionId, timestampTypeId, executedAt)
VALUES
(
	(SELECT id from user where id = ?), 
    (SELECT id from confession where id = ?), 
    (SELECT id from timestamptype where label = 'Published'), 
    NOW()
);`, 
    createRejectedTimestamp: `INSERT INTO confesssiontimestamp (userId, confessionId, timestampTypeId, executedAt)
VALUES
(
	(SELECT id from user where id = ?), 
    (SELECT id from confession where id = ?), 
    (SELECT id from timestamptype where label = 'Rejected'), 
    NOW()
)`,
    getPublishedConfessionAdmin: `SELECT 
    confessor.username,
    confessor.id as userId, 
    confession.id as confessionId,
    confession.title, 
    confession.body,
    executor.username as executedBy,
    confesssiontimestamp.executedAt,
    GROUP_CONCAT(tag.label SEPARATOR ', ') AS tags
FROM user confessor
INNER JOIN confession ON 
    confessor.id = confession.userId
LEFT JOIN confessiontag ON
    confession.id = confessiontag.confessionId
LEFT JOIN tag ON 
    tag.id = confessiontag.confessiontagId
LEFT JOIN status ON 
    confession.statusId = status.id
LEFT JOIN confesssiontimestamp ON 
	confesssiontimestamp.confessionId = confession.id
LEFT JOIN user executor on 
	confesssiontimestamp.userId = executor.id
WHERE 
    status.label = 'Published'
GROUP BY 
    confessor.id, 
    confessor.username,
    confession.id, 
    confession.title,
    confession.body,
    executor.username, 
    confesssiontimestamp.executedAt`, 
    getRejectedConfessionAdmin: `SELECT 
    confessor.username,
    confessor.id as userId, 
    confession.id as confessionId,
    confession.title, 
    confession.body,
    executor.username as executedBy,
    confesssiontimestamp.executedAt,
    GROUP_CONCAT(tag.label SEPARATOR ', ') AS tags
FROM user confessor
INNER JOIN confession ON 
    confessor.id = confession.userId
LEFT JOIN confessiontag ON
    confession.id = confessiontag.confessionId
LEFT JOIN tag ON 
    tag.id = confessiontag.confessiontagId
LEFT JOIN status ON 
    confession.statusId = status.id
LEFT JOIN confesssiontimestamp ON 
	confesssiontimestamp.confessionId = confession.id
LEFT JOIN user executor on 
	confesssiontimestamp.userId = executor.id
WHERE 
    status.label = 'Rejected'
GROUP BY 
    confessor.id, 
    confessor.username,
    confession.id, 
    confession.title,
    confession.body,
    executor.username, 
    confesssiontimestamp.executedAt`
};

module.exports = confessionQueries;
