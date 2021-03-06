const config = {};

config.development = {
    baseUrl: process.env.BASE_URL || 'http://localhost:8080',
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    dbUrl: process.env.MONGO_URL,
    port: process.env.PORT || 8080,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    firebase_messaging: {
        serverKey: process.env.SERVER_KEY
    },
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
    },
    web: {
        cors: true
    },
    slackApiToken: process.env.SLACK_API_TOKEN,
    slackChannel: 'dev-test',
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    }
};

config.staging = config.development;
config.production = {
    ...config.development,
    slackChannel: '_general'
};

config.test = {
    baseUrl: 'http://localhost:8081',
    dbUrl: process.env.MONGO_URL,
    port: 8081,
    google_client_id: 'testClientId',
    google_client_secret: 'testClientSecret',
    firebase_messaging: {
        serverKey: 'testServerKey'
    },
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
    },
    testCustomerId: 'googleTestCustomerId',
    testCustomerName: 'TestCustomer',
    testProjectId: 99999999,
    web: {},
    testUser: {
        _id: "5fae6392bf0b6145db146775",
        email: 'test@test.com',
        password: 'test11',
        companyName: 'testMakers'
    },
    jwt: {
        secret: "testSecretKey",
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    accessToken: {
        valid: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDcwNzI1NDAsImV4cCI6MTAxNjA3MDcyNTM5LCJpZCI6IjVmYWU2MzkyYmYwYjYxNDVkYjE0Njc3NSJ9.RwaowkqxPYCOeY-QhX-shdnE0_B7SCThDIRFheIkohA",
        expired: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDcwNjgyODQsImV4cCI6MTYwNzA2ODI4NSwiaXNzIjoiNWZhZTYzOTJiZjBiNjE0NWRiMTQ2Nzc1In0.ciMEsYhy00stqMsSyZOO940hbfJiWHdFCmGSm3fGRgo",
        invalid: "invalid"
    }
};

module.exports = config[process.env.NODE_ENV];
