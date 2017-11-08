const Apps = require('../models/apps');

const getApps = (req, res) => {
    if (!req.query.keyword) {
        res.sendStatus(412);
    } else {
        Apps.find({appName: new RegExp(req.query.keyword, "i")})
            .limit(5)
            .exec()
            .then(result => {
                if (result.length === 0) {
                    res.sendStatus(204);
                } else {
                    res.json(result);
                }
            })
            .catch(err => res.status(500).json({error: err}));
    }
};

module.exports = {getApps};