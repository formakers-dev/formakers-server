module.exports = {
    development : {
        dbUrl: process.env.MONGO_URL,
        port: process.env.PORT || 8080,
    },
    test: {
        dbUrl: process.env.MONGO_URL,
        port: process.env.PORT || 3000,
    }
};