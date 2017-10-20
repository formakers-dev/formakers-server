const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const port = require('./config').port;
const passport = require('passport');

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
app.use(cors());
app.use('/auth', require('./routers/auth'));
app.use('/app', require('./routers/app'));
app.use('/user', require('./routers/user'));
app.use('/notification', require('./routers/notification'));

app.get('/', function (req, res) {
    res.send('Hello AppBee-dragon')
});

http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});
