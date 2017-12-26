const chai = require('chai');
const should = chai.should();
const server = require('../server');
const request = require('supertest').agent(server);
const Users = require('../models/users');

describe('Auth', () => {
    describe('GET /auth/check_login', () => {
        const userData = [{
            userId: 'userId1',
            name: '혜리',
            registrationToken: 'registrationToken1'
        }];
        describe('로그인된 상태에서 호출 시', () => {
            beforeEach((done) => {
                server.request.isAuthenticated = () => true;
                server.request.user = 'userId1';
                Users.create(userData, done);
            });

            it('로그인 된 사용자의 이름을 리턴한다', done => {
                request.get('/auth/check_login')
                    .expect(200)
                    .then(res => {
                        console.log(res);
                        res.body.username.should.be.eql('혜리');
                        done();
                    }).catch(err => done(err));
            });

            afterEach(done => {
                Users.remove({}, done);
            })
        });

        describe('로그인되지 않은 상태에서 호출 시', () => {
            beforeEach(() => {
                server.request.isAuthenticated = () => false;
            });

            it('로그인 되지 않은 상태에서는 401을 리턴한다', done => {
                request.get('/auth/check_login').expect(401, done)
            });
        });
    });
});
