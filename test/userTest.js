const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const Users = require('./../models/users');
const { getRegistrationIds } = require('./../controllers/user');

require('../server');

describe('AppUsages', () => {
    const userData = [{
        userId: 'userId1',
        registrationToken: 'registrationToken1'
    },{
        userId: 'userId2',
        registrationToken: 'registrationToken2'
    }];

    beforeEach((done) => {
        Users.create(userData, done);
    });

    it('getRegistrationIds호출시', (done)=> {
        const userIds = ['userId1', 'userId2'];
        getRegistrationIds(userIds).then(result => {
            expect(result).to.have.lengthOf(2);
            expect(result).to.include('registrationToken1');
            expect(result).to.include('registrationToken2');
            done();
        }).catch(err => {
            done(err);
        })
    });

    afterEach((done) => {
        Users.remove({userId: {$in: ['userId1', 'userId2']}}, done);
    });
});
