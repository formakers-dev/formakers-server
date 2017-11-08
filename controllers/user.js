const Users = require('../models/users');

const getRegistrationIds  = (userList) => {
    return Users.find({userId: {$in: userList}}).then(users => {
        const result = [];
        users.forEach(user => {
            result.push(user.registrationToken)
        });
        return result;
    });
};

module.exports = { getRegistrationIds };