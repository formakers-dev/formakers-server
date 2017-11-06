const AppUsages = require('../models/appUsages');

const getUserListByPackageName = (packageName) => {
    return AppUsages.distinct('users.registrationId', {packageName: packageName});
};

module.exports = { getUserListByPackageName };
