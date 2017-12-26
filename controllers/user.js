const Users = require('../models/users');

const getRegistrationIds = (userList) => {
    return Users.find({userId: {$in: userList}}).then(users => {
        const result = [];
        users.forEach(user => result.push(user.registrationToken));
        return result;
    });
};

const getUser = (req, res) => {
    Users.findOne({userId: req.userId}).then(user => {
        res.json({username: user.name});
    }).catch(err => send500ErrorJson(err, res));
};

const send500ErrorJson = (err, res) => {
    console.log(err);
    res.status(500).json({error: err});
};

module.exports = {getRegistrationIds, getUser};