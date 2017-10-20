const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config');
const should = chai.should();
const server = require('../server');

chai.use(chaiHttp);

describe('Auth', () => {
    describe('GET /auth/check_login', () => {
        //TODO : 로그인된 상태 호출에 대한 테스트 추가 필요
        // describe('로그인된 상태에서 호출 시', () => {
            // const Middleware = require('../middlewares/middleware');
            //
            // // beforeEach(function() {
            // //     sinon.stub(Middleware, 'auth').callsFake((req, res, next) => {
            // //         return next();
            // //     });
            // // });
            //
            // it('로그인 된 상태에서는 200을 리턴한다', done => {
            //     server.request.isAuthenticated = () => true;
            //
            //     chai.request(server)
            //         .get('/auth/check_login')
            //         .auth()
            //         .send()
            //         .end((err, res) => {
            //             res.statusCode.should.be.eql(200);
            //             server.close;
            //             done();
            //         })
            // });
            //
            // // afterEach(function() {
            // //     Middleware.auth.restore();
            // // });
        // });

        describe('로그인되지 않은 상태에서 호출 시', () => {
            it('로그인 되지 않은 상태에서는 401을 리턴한다', done => {
                chai.request(server)
                    .get('/auth/check_login')
                    .send()
                    .end((err, res) => {
                        res.statusCode.should.be.eql(401);
                        server.close;
                        done();
                    });
            });
        });

    });
});