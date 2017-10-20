const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config');
const should = chai.should();

chai.use(chaiHttp);

describe('App Controller', () => {
    describe('GET Apps', () => {
        it('키워드로 앱이름을 검색하여 결과리스트를 리턴한다', done => {
            chai.request(server)
                .get('/app?keyword=Kakao')
                .send()
                .end((err, res) => {
                    res.statusCode.should.be.eql(200);
                    res.body.length.should.be.eql(2);
                    res.body[0].appName.should.be.contains("Kakao");
                    res.body[1].appName.should.be.contain("Kakao");
                    done();
                });
        });
    });

    it('키워드가 없으면 사전조건 실패(412)를 리턴한다', done => {
        chai.request(server)
            .get('/app?keyword=')
            .send()
            .end((err, res) => {
                res.statusCode.should.be.eql(412);
                res.body.should.be.empty;
                done();
            });
    });

    it('검색 결과가 없으면 제공할 컨텐츠 없음(204)를 리턴한다', done => {
        chai.request(server)
            .get('/app?keyword=없는키워드')
            .send()
            .end((err, res) => {
                res.statusCode.should.be.eql(204);
                res.body.should.be.empty;
                done();
            });
    });

});