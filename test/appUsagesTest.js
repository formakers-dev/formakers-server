const chai = require('chai');
const should = chai.should();
const server = require('../server');
const AppUsages = require('./../models/appUsages');
const { getUserListByPackageName } = require('./../controllers/appUsages');

describe('AppUsages', () => {

    const data = {
        packageName: 'com.kakao.talk',
        users: [{
            userId: 'testUserId',
            registrationId: 'testRegistrationId'
        }]
    };

    beforeEach((done) => {
        AppUsages.findOneAndUpdate({packageName: 'com.kakao.talk'}, {$set: data}, {upsert: true}, done);
    });

    it('getUserListByPackageName 호출시, packageName을 사용하는 유저 리스트를 조회한다', (done) => {
        getUserListByPackageName('com.kakao.talk')
            .then((result) => {
                result[0].should.be.eql('testRegistrationId');
                done();
            }).catch(err => done(err));
    });

    afterEach((done) => {
        AppUsages.remove({packageName: 'com.kakao.talk'}, done);
    });
});
