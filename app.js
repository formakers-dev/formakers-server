var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config')[process.env.NODE_ENV];

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var cors = require('cors');
var http = require('http');

// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    console.log('serialize');
    done(null, user);
});

// deserialize
// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function (user, done) {
    //findById(id, function (err, user) {
    console.log('deserialize');
    done(null, user);
    //});
});

passport.use(new GoogleStrategy({
    clientID: config.google_client_id,
    clientSecret: config.google_client_secret,
    callbackURL: "/auth/google/callback"
}, function (accessToken, refreshToken, profile, done) {

    console.log("#### google auth callback");
    console.log("#### accessToken\n" + accessToken);
    console.log("#### refreshToken\n" + refreshToken);
    console.log("#### profile\n" + profile);
    done(null, profile);
}));


app.set('port', process.env.PORT || 8080);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({secret: 'mySessionSecret'}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

app.get('/', function (req, res) {
    res.send('Hello AppBee-dragon')
});

app.get('/auth/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']}));
app.get('/auth/google/callback',
    passport.authenticate('google', {successRedirect: '/login_success', failureRedirect: '/login_fail'}));

app.get('/login_success', ensureAuthenticated, function (req, res) {
    console.log('### login success');
    //console.log('### user' + req.user);

    var user = req.user;
    var provider = user.provider;
    var id = user.id;
    var familyName = user.name.familyName;
    var givenName = user.name.givenName;

    console.log('### provider : ' + provider);
    console.log('### id : ' + id);
    console.log('### familyName : ' + familyName);
    console.log('### givenName : ' + givenName);
    //res.send(req.user);

    res.redirect('http://localhost:3000?familyName=' + familyName + '&givenName=' + givenName);
});

app.get('/logout', function (req, res) {
    req.logout();
    console.log("### logout");
    res.redirect('http://localhost:3000');
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) {
        return next();
    }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}

var router = require('./routes')(app);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    console.log('Conencted to mongodb server');
});

mongoose.connect(config.dbUrl);
