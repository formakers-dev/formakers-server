const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../config')[process.env.NODE_ENV];
const Customers = require('../models/customers');

// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    done(null, user.provider + user.id);
});

// deserialize
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

router.get('/google', passport.authenticate('google', {scope: ['email', 'profile']}));
router.get('/google/callback', passport.authenticate('google', {successRedirect: '/auth/login_success', failureRedirect: '/auth/login_fail'}));


router.get('/login_success', ensureAuthenticated, function (req, res) {
    res.redirect(config.frontendBaseUrl);
});

router.get('/logout', function (req, res) {
    req.logout();
    console.log("### logout");
    res.redirect(config.frontendBaseUrl);
});


//TODO : 미들웨어로 분리
function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) {
        return next();
    }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}

module.exports = router;