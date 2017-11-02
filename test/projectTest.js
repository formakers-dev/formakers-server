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
        "status": "temporary"
    };

    beforeEach(() => {
        server.request.isAuthenticated = () => true;
        server.request.user = config.testCustomerId;
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

            beforeEach(done => {
                Projects.create(data, () => done());
            });

            it('기존데이터일 경우 업데이트한다', done => {
                request.post('/project')
                    .send(data)
                    .expect(200)
                    .then(() => {
                        Projects.find({$and: [{projectId: data.projectId}]})
                            .then((res) => {
                                const body = res[0];
                                body.projectId.should.be.eql(config.testProjectId);
                                body.customerId.should.be.eql(config.testCustomerId);
                                body.name.should.be.eql('old-test-project');
                                body.introduce.should.be.eql('간단소개');
                                body.images.should.be.eql(["/image1", "/image2"]);
                                body.apps.should.be.eql(["com.kakao.talk"]);
                                body.interviewer_introduce.should.be.eql("인터뷰 진행자 소개!!!");
                                body.description.should.be.eql('프로젝트 상세 설명 수정');
                                body.description_images.should.be.eql(["/desc/image1", "/desc/image2"]);
                                body.interview.type.should.be.eql(1);
                                body.interview.location_negotiable.should.be.eql(false);
                                body.interview.location.should.be.eql("향군타워 5층");
                                body.interview.open_date.should.be.eql("20171011");
                                body.interview.close_date.should.be.eql("20171016");
                                body.interview.date_negotiable.should.be.eql(false);
                                body.interview.start_date.should.be.eql("20171101");
                                body.interview.end_date.should.be.eql("20171131");
                                body.interview.plans.should.be.eql([
                                    {"minute": 10, "plan": "제품 소개"},
                                    {"minute": 30, "plan": "테스트진행"},
                                    {"minute": 20, "plan": "피드백"}
                                ]);
                                body.status.should.be.eql("temporary");

                                done();
                            });
                    });
            });
        });
    });

    describe('프로젝트 데이터가 등록된 상황에서', () => {
        const notMyProjectData = {
            "projectId": "someoneProjectId",
            "customerId": "someoneId",
            "name": "not-my-project"
        };

        beforeEach(done => {
            Projects.create(data, () => {
                Projects.create(notMyProjectData, () => done());
            });
        });

        describe('GET /projects', () => {
            it('프로젝트 목록 조회 시 본인의 프로젝트목록만 리턴한다', done => {
                request.get('/projects')
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.length).to.be.eql(1);
                        expect(res.body[0].customerId).to.be.eql(config.testCustomerId);
                        done();
                    });
            });
        });

        describe('GET /project', () => {
            it('본인의 데이터인 경우 프로젝트 정보를 리턴한다', done => {
                request.get('/project?projectId=' + data.projectId)
                    .expect(200)
                    .end((err, res) => {
                        res.body.length.should.be.eql(1);
                        res.body[0].projectId.should.be.eql(data.projectId);
                        done();
                    });
            });

            it('본인의 데이터가 아닌 경우 서버 오류를 리턴한다', done => {
                request.get('/project?projectId=' + data.projectId)
                    .expect(500)
                    .end(() => done());
            });
        });

        afterEach(done => {
            Projects.remove({customerId: notMyProjectData.customerId})
                .exec()
                .then(done());
        });
    });

    afterEach(done => {
        Projects.remove({customerId: data.customerId})
            .exec()
            .then(done());
    });
});