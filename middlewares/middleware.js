function auth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.send(401);
    }
}

module.exports = {auth};