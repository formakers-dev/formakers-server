const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config')[process.env.NODE_ENV];
const cors = require('cors');
const http = require('http');
const port = config.port;
const passport = require('passport');
const authRouter = require('./routers/auth');

require('./db').init();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.use(session({secret: 'appbeeSecret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use('/auth', authRouter);

const router = require('./routers')(app);

app.get('/', function (req, res) {
    res.send('Hello AppBee-dragon')
});

http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});
