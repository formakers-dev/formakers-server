const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const expect = chai.expect;

const Projects = require('./../models/projects');

describe('Project', () => {

    const data = {
        "projectId": config.testProjectId,
        "customerId": config.testCustomerId,
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "apps": ["com.kakao.talk"],
        "interviewer_introduce": "인터뷰 진행자 소개!!!",
        "description": "프로젝트 상세 설명",
        "description_images": ["/desc/image1", "/desc/image2"],
        "interview": {
            "type": 1,
            "location_negotiable": false,
            "location": "향군타워 5층",
            "open_date": "20171011",
            "close_date": "20171016",
            "date_negotiable": false,
            "start_date": "20171101",
            "end_date": "20171131",
            "plans": [{"minute": 10, "plan": "제품 소개"}, {"minute": 30, "plan": "테스트진행"}, {
                "minute": 20,
                "plan": "피드백"
            }]
        },
        "status": 0
    };

    beforeEach(() => {
        server.request.isAuthenticated = () => true;
        server.request.user = { id: config.testCustomerId };
    });

    describe('POST /project', () => {
        describe('신규 데이터인 경우 테스트', () => {
            it('신규입력일 경우 projectId를 생성하여 저장한다', done => {
                request.post('/project')
                    .send(data)
                    .expect(200)
                    .then(done());
            });
        });

        describe('기존 데이터인 경우 테스트', () => {
            data.description = '프로젝트 상세 설명 수정';

            beforeEach('테스트 전 데이터 등록', done => {
                Projects.create(data, () => done());
            });

            it('기존데이터일 경우 업데이트한다', done => {
                request.post('/project')
                    .send(data)
                    .expect(200)
                    .then(() => {
                        Projects.find({$and: [{customerId: data.customerId}, {projectId: data.projectId}]})
                            .then((res) => {
                                const body = res[0];
                                body.description.should.be.eql('프로젝트 상세 설명 수정');
                                expect(body).has.property('projectId');
                                expect(body).has.property('customerId');
                                expect(body).has.property('name');
                                expect(body).has.property('introduce');
                                expect(body).has.property('images');
                                expect(body).has.property('apps');
                                expect(body).has.property('interviewer_introduce');
                                expect(body).has.property('description');
                                expect(body).has.property('description_images');
                                expect(body).has.property('interview');
                                expect(body.interview).has.property('type');
                                expect(body.interview).has.property('location_negotiable');
                                expect(body.interview).has.property('location');
                                expect(body.interview).has.property('open_date');
                                expect(body.interview).has.property('close_date');
                                expect(body.interview).has.property('date_negotiable');
                                expect(body.interview).has.property('start_date');
                                expect(body.interview).has.property('end_date');
                                expect(body.interview).has.property('plans');
                                expect(body.interview.plans[0]).has.property('minute');
                                expect(body.interview.plans[0]).has.property('plan');
                                expect(body).has.property('status');

                                done();
                            });
                    });
            });
        });
    });

    describe('GET /projects', () => {
        beforeEach('테스트 전 데이터 생성', done => {
            Projects.create(data, () => done());
        });

        it('프로젝트 목록 조회', done => {
            request.get('/projects')
                .expect(200)
                .end((err, res) => {
                    expect(res.body.length).to.be.eql(1);
                    done();
                });
        });
    });

    describe('GET /project', () => {
        beforeEach('테스트 전 데이터 생성', done => {
            Projects.create(data, () => done());
        });

        it('프로젝트 단건 조회', done => {
            request.get('/project?projectId=' + config.testProjectId)
                .expect(200)
                .end((err, res) => {
                    res.body.length.should.be.eql(1);
                    res.body[0].projectId.should.be.eql(config.testProjectId);
                    done();
                });
        });
    });

    afterEach('테스트 후 테스트 데이터 삭제', done=> {
        Projects.remove({customerId: config.testCustomerId})
            .exec()
            .then(done());
    });
});