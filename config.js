const config = {
    development : {
        baseUrl: process.env.BASE_URL || 'http://localhost:8080',
        frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
        dbUrl: process.env.MONGO_URL,
        port: process.env.PORT || 8080,
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
        firebase: {
            serverKey: process.env.SERVER_KEY
        }
    },
    test: {
        baseUrl: 'http://localhost:8081',
        dbUrl: process.env.MONGO_URL,
        port: 8081,
        google_client_id: 'testClientId',
        google_client_secret: 'testClientSecret',
        firebase: {
            serverKey: 'testServerKey'
        },
        testUserId: 'google115838807161306170827',
    }
};

module.exports = config[process.env.NODE_ENV];