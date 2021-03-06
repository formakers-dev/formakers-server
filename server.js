const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');

const port = require('./config').port;
const config = require('./config');

require('./db').init();

const corsOptions = {
    origin: '*', // config.frontendBaseUrl,
    credentials: true
};

if (config.web.cors) {
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
}

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.use(morgan('combined'));

app.use(session({secret: 'appbeeSecret',
    saveUninitialized: true,
    resave: false,
    cookie: {
        path: "/",
    }
}));

// ===== Router =====
// app.use('/', require('./routers'));
app.use('/users', require('./routers/users'));
app.use('/requests', require('./routers/requests'));
app.use('/auth', require('./routers/auth'));
app.use('/beta-tests', require('./routers/betaTests'));

http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});

module.exports = app;
