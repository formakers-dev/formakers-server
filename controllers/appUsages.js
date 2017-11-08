const AppUsages = require('../models/appUsages');

const getUserIdsByPackageNames = (packageNameList) => {
    return AppUsages.find({ packageName : {$in: packageNameList} }).then(apps => {
        const result = new Set();
        apps.forEach(app => {
            app.users.forEach(user => {
                result.add(user.userId);
            });
        });
        return Array.from(result);
    });
};

module.exports = { getUserIdsByPackageNames };
