const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const AppUsages = require('./../models/appUsages');
const { getUserIdsByPackageNames } = require('./../controllers/appUsages');

require('../server');

describe('AppUsages', () => {

    const appUsagesData = [{
            packageName: 'packageName1',
            users: [{
                userId: 'testUserId1',
                registrationId: 'testRegistrationId1'
            },
            {
                userId: 'testUserId2',
                registrationId: 'testRegistrationId2'
            }]
            },{
            packageName: 'packageName2',
            users: [{
                userId: 'testUserId3',
                registrationId: 'testRegistrationId3'
            },
            {
                userId: 'testUserId4',
                registrationId: 'testRegistrationId4'
            },
            {
                userId: 'testUserId4',
                registrationId: 'testRegistrationId4'
            }]
    }];

    beforeEach((done) => {
        AppUsages.create(appUsagesData, done);
    });

    it('getUsersByPackageNames호출시 중복을 제거한 userId 리스트가 조회된다', (done)=> {
        const packageNames = ['packageName1', 'packageName2'];
        getUserIdsByPackageNames(packageNames).then(result => {
            expect(result).to.have.lengthOf(4);
            expect(result).to.include('testUserId1');
            expect(result).to.include('testUserId2');
            expect(result).to.include('testUserId3');
            expect(result).to.include('testUserId4');
            done();
        }).catch(err => {
            done(err);
        })
    });

    afterEach((done) => {
        AppUsages.remove({packageName: {$in: ['packageName1', 'packageName2']}}, done);
    });
});
