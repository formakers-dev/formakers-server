const config = require('../config');
const Customers = require('../models/customers');

const setupNormalAuth = (req, done) => {
    req.isAuthenticated = () => true;
    req.user = {};
    req.user.id = config.testCustomerId;
    req.user.name = config.testCustomerName;

    Customers.create({
        id: config.testCustomerId,
        email: 'gdragon@google.com',
        name: config.testCustomerName,
        providerId: 'google' + config.testCustomerId,
        provider: 'google',
        verified: true
    }, done);
};

const setupUnauthorizedAuth = (req, done) => {
    const unauthorizedCustomerId = 'unauthorizedCustomerId';
    const unauthorizedCustomerName = 'unauthorizedCustomerName';

    req.isAuthenticated = () => true;
    req.user = {};
    req.user.id = unauthorizedCustomerId;
    req.user.name = unauthorizedCustomerName;

    Customers.create({
        id: unauthorizedCustomerId,
        email: 'unknown@google.com',
        name: unauthorizedCustomerName,
        providerId: 'google' + unauthorizedCustomerId,
        provider: 'google'
    }, done);
};

const setupNotLoggedInAuth = (req, done) => {
    req.isAuthenticated = () => false;
    req.user = {};
    req.user.id = 'notLoggedInId';
    req.user.name = 'notLoggedInName';

    done();
};


const clearAuthSetup = (done) => {
    Customers.remove({}, done);
};

module.exports = {setupNormalAuth, setupUnauthorizedAuth, setupNotLoggedInAuth, clearAuthSetup};