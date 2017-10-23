const chai = require('chai');
const config = require('../config');
const server = require('../server');
const request = require('supertest').agent(server);

describe('Auth', () => {
    describe('GET /auth/check_login', () => {
        describe('로그인된 상태에서 호출 시', () => {
            beforeEach(() => {
                server.request.isAuthenticated = () => true;
            });

            it('로그인 된 상태에서는 200을 리턴한다', done => {
                request.get('/auth/check_login').expect(200, done)
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
