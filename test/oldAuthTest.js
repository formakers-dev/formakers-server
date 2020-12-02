const chai = require('chai');
const should = chai.should();
const server = require('../server');
const request = require('supertest').agent(server);
const config = require('../config');
const setupTestMiddleware = require('./setupTestMiddleware');

describe.skip('Middleware', () => {
    describe('GET /auth/check_login', () => {
        describe('로그인된 상태에서 호출 시', () => {
            beforeEach(done => setupTestMiddleware.setupNormalAuth(server.request, done));

            it('로그인 된 사용자의 이름을 리턴한다', done => {
                request.get('/auth/check_login')
                    .expect(200)
                    .then(res => {
                        res.body.username.should.be.eql(config.testCustomerName);
                        done();
                    }).catch(err => done(err));
            });

            afterEach(done => setupTestMiddleware.clearAuthSetup(done));
        });

        describe('요청한 사용자가 인가되지 않은 사용자일 경우', () => {
            beforeEach(done => setupTestMiddleware.setupUnauthorizedAuth(server.request, done));

            it('인가되지 않은 에러코드(403)을 리턴한다', done => {
                request.get('/auth/check_login').expect(403, done);
            });

            afterEach(done => setupTestMiddleware.clearAuthSetup(done));
        });

        describe('로그인되지 않은 상태에서 호출 시', () => {
            beforeEach(done => setupTestMiddleware.setupNotLoggedInAuth(server.request, done));

            it('로그인 되지 않은 상태에서는 401을 리턴한다', done => {
                request.get('/auth/check_login').expect(401, done);
            });

            afterEach(done => setupTestMiddleware.clearAuthSetup(done));
        });
    });
});
