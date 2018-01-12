const chai = require('chai');
const should = chai.should();
const server = require('../server');
const request = require('supertest').agent(server);

describe('Auth', () => {
    describe('GET /auth/check_login', () => {
        describe('로그인된 상태에서 호출 시', () => {
            beforeEach(() => {
                server.request.isAuthenticated = () => true;
                server.request.user = {};
                server.request.user.id = 'id1';
                server.request.user.name = '지용';
            });

            it('로그인 된 사용자의 이름을 리턴한다', done => {
                request.get('/auth/check_login')
                    .expect(200)
                    .then(res => {
                        console.log(res);
                        res.body.username.should.be.eql('지용');
                        done();
                    }).catch(err => done(err));
            });
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
