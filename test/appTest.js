const chai = require('chai');
const server = require('../server');
const request = require('supertest').agent(server);
const should = chai.should();

describe('App', () => {
    describe('GET /apps', () => {
        beforeEach(() => {
            server.request.isAuthenticated = () => true;
        });

        it('키워드로 앱이름을 검색하여 결과를 최대 5개만 리턴한다', done => {
            request.get('/apps?keyword=Kakao')
                .expect(200)
                .end((err, res) => {
                    res.body.length.should.be.eql(5);
                    res.body[0].appName.should.be.contains("Kakao");
                    done();
                });
        });

        it('키워드가 없으면 사전조건 실패(412)를 리턴한다', done => {
            request.get('/apps?keyword=').expect(412, done);
        });

        it('검색 결과가 없으면 제공할 컨텐츠 없음(204)를 리턴한다', done => {
            request.get('/apps?keyword=없는키워드').expect(204, done)
        });
    });
});
