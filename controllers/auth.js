const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../config');
const Customers = require('../models/customers');

// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    done(null, user.provider + user.id);
});

// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function (userId, done) {
    done(null, userId);
});

passport.use(new GoogleStrategy({
    clientID: config.google_client_id,
    clientSecret: config.google_client_secret,
    callbackURL: config.baseUrl + "/auth/google/callback"
}, function (accessToken, refreshToken, profile, done) {
    let customer = {};
    customer.id = profile.provider + profile.id;
    customer.provider = profile.displayName;
    customer.providerId = profile.id;
    customer.name = profile.displayName;
    customer.email = (profile.emails)? profile.emails[0].value : "";

    Customers.findOneAndUpdate({ id : customer.id }, { $set : customer }, { upsert : true })
        .exec()
        .then(() => done(null, profile))
        .catch((err) => done(err));
}));

const googleAuth = passport.authenticate('google', {scope: ['email', 'profile']});
const googleAuthCallback = passport.authenticate('google', {successRedirect: '/auth/login_success', failureRedirect: '/auth/login_fail'});
const loginSuccess = (req, res) => res.redirect(config.frontendBaseUrl);
const loginFail = (req, res) => res.redirect(config.frontendBaseUrl);

const logout = (req, res) => {
    req.logout();
    res.send(200);
};

module.exports = {googleAuth, googleAuthCallback, loginSuccess, loginFail, logout};