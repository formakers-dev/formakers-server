const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const port = require('./config').port;
const passport = require('passport');
const config = require('./config');

require('./db').init();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.use(session({secret: 'appbeeSecret',
    saveUninitialized: true,
    resave: false,
    cookie: {
        path: "/",
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({origin: config.frontendBaseUrl, credentials: true}));
app.use('/', require('./routers/router'));

http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});
