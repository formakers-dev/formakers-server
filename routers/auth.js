const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../config')[process.env.NODE_ENV];

// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    console.log('serialize');
    done(null, user);
});

// deserialize
// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function (user, done) {
    console.log('deserialize');
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: config.google_client_id,
    clientSecret: config.google_client_secret,
    callbackURL: config.baseUrl + "/auth/google/callback"
}, function (accessToken, refreshToken, profile, done) {

    console.log("#### google auth callback");
    console.log("#### accessToken\n" + accessToken);
    console.log("#### refreshToken\n" + refreshToken);
    console.log("#### profile\n" + profile);
    done(null, profile);
}));

router.get('/google', passport.authenticate('google', {scope: ['email', 'profile']}));
router.get('/google/callback', passport.authenticate('google', {successRedirect: '/auth/login_success', failureRedirect: '/auth/login_fail'}));


router.get('/login_success', ensureAuthenticated, function (req, res) {
    console.log('### login success');
    console.log('### user' + req.user);

    const user = req.user;
    const provider = user.provider;
    const id = user.id;
    const displayName = user.displayName;

    console.log('### provider : ' + provider);
    console.log('### id : ' + id);
    console.log('### displayName : ' + user.displayName);
    console.log('### emails : ' + user.emails[0].value);

    res.redirect(config.frontendBaseUrl + '?displayName=' + displayName);
});

router.get('/logout', function (req, res) {
    req.logout();
    console.log("### logout");
    res.redirect(config.frontendBaseUrl);
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) {
        return next();
    }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}

module.exports = router;