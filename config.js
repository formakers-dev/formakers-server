module.exports = {
    development : {
        dbUrl: process.env.MONGO_URL,
        port: process.env.PORT || 8080,
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    test: {
        dbUrl: process.env.MONGO_URL,
        port: process.env.PORT || 3000,
    }
};