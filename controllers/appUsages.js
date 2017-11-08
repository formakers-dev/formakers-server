const AppUsages = require('../models/appUsages');

const getUserIdsByPackageNames = (packageNameList) => {
    return AppUsages.find({packageName: {$in: packageNameList}}).then(apps => {
        const result = [];
        apps.forEach(app => result.push(...app.users.map(user => user.userId)));
        return [...new Set(result)];
    });
};

module.exports = {getUserIdsByPackageNames};
