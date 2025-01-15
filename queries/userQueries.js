const userQueries = {
    createUser: `
    INSERT INTO user (userTypeId, username, password, nickname, createdAt)
VALUES ((SELECT id from user where label = 'User'), ?, ?, ?, NOW());
    `,

    getUserTypeUserId: `
        SELECT id from usertype 
        WHERE label = 'User'
        ORDER BY id ASC
        LIMIT 1
    `,
    getUserById: `SELECT * FROM user 
LEFT JOIN userType on user.userTypeId = userType.id
WHERE user.id = ?`,
    updateUserById: `UPDATE User 
SET nickname = ?
WHERE id = ?;`,
    deleteUserById: `DELETE FROM User 
WHERE id = ?;`,
    getUserByUsernameAndPassword: `SELECT id, username, password 
FROM user
WHERE username = ? AND 
password = ?`,
    getUserByUsername: `SELECT id, username
FROM user 
WHERE username = ?`,
    getUserByUsername: `SELECT username from user 
WHERE username = ?`,
    createUserUserType: `INSERT INTO usertype (label, isActive)
VALUES ('User', 1);`
};

module.exports = userQueries;
