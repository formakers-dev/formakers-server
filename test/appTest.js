const chai = require('chai');
const server = require('../server');
const request = require('supertest').agent(server);
const should = chai.should();
const Apps = require('../models/apps');
const setupTestMiddleware = require('./setupTestMiddleware');

describe('App', () => {
    before(done => setupTestMiddleware.setupNormalAuth(server.request, done));

    describe('GET /apps', () => {
        const appsData = [{
            appName: 'com.Kakao.1',
            description: '카카오톡1',
            developer: '카카오',
            categoryName1: '분류1',
            categoryName2: ''
        },{
            appName: 'com.Kakao.2',
            description: '카카오톡2',
            developer: '카카오',
            categoryName1: '분류2',
            categoryName2: ''
        },{
            appName: 'com.Kakao.3',
            description: '카카오톡3',
            developer: '카카오',
            categoryName1: '분류3',
            categoryName2: ''
        },{
            appName: 'com.Kakao.4',
            description: '카카오톡4',
            developer: '카카오',
            categoryName1: '분류4',
            categoryName2: ''
        },{
            appName: 'com.Kakao.5',
            description: '카카오톡5',
            developer: '카카오',
            categoryName1: '분류5',
            categoryName2: ''
        },{
            appName: 'com.Kakao.6',
            description: '카카오톡6',
            developer: '카카오',
            categoryName1: '분류6',
            categoryName2: ''
        }];

        before(done => {
            Apps.create(appsData, done);
        });

        it('키워드로 앱이름을 검색하여 결과를 최대 5개만 리턴한다', done => {
            request.get('/apps?keyword=Kakao')
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(5);
                    res.body[0].appName.should.be.contains("Kakao");
                    done();
                }).catch(err => done(err));
        });

        it('키워드가 없으면 사전조건 실패(412)를 리턴한다', done => {
            request.get('/apps?keyword=').expect(412, done);
        });

        it('검색 결과가 없으면 제공할 컨텐츠 없음(204)를 리턴한다', done => {
            request.get('/apps?keyword=없는키워드').expect(204, done)
        });

        after(done => {
            Apps.remove({}, done);
        });
    });

    after(done => setupTestMiddleware.clearAuthSetup(done));
});
