const chai = require('chai');
const sinon = require('sinon');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();

const Projects = require('./../models/projects');

describe('Project', () => {
    const sandbox = sinon.sandbox.create();
    let clock;

    const oldData = {
        "projectId": config.testProjectId,
        "customerId": config.testCustomerId,
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "description": "프로젝트 상세 설명",
        "descriptionImages": ["/desc/image1", "/desc/image2"],
        "status": "temporary",
        "interviewer": {
            "name": "혜리",
            "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a",
            "introduce": "툰스토리 디자이너"
        }
    };

    const newData = {
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "description": "프로젝트 상세 설명",
        "descriptionImages": ["/desc/image1", "/desc/image2"],
        "status": "registered",
        "interviewer": {
            "name": "혜리",
            "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a",
            "introduce": "툰스토리 디자이너"
        }
    };

    beforeEach(() => {
        server.request.isAuthenticated = () => true;
        server.request.user = config.testCustomerId;
    });

    describe('POST /projects', () => {
        describe('신규 데이터인 경우 테스트', () => {
            it('신규입력일 경우 projectId를 생성하여 저장한다', done => {
                request.post('/projects')
                    .send(newData)
                    .expect(200, done);
            });

            it('API 호출 성공시 생성된 projectId를 반환한다', done => {
                request.post('/projects')
                    .send(newData)
                    .expect(200)
                    .then((res) => {
                        res.body.should.haveOwnProperty('projectId');
                        res.body.projectId.should.not.be.undefined;
                        done();
                    }).catch(err => done(err));
            });
        });

        describe('기존 데이터인 경우 테스트', () => {
            beforeEach(done => {
                Projects.create(oldData, () => done());
            });

            it('기존데이터일 경우 업데이트한다', done => {
                let updatingData = oldData;
                updatingData.description = '프로젝트 상세 설명 수정';

                request.post('/projects')
                    .send(updatingData)
                    .expect(200)
                    .then(() => {
                        Projects.find({$and: [{projectId: oldData.projectId}]}, (err, res) => {
                            const body = res[0];
                            body.customerId.should.be.eql(oldData.customerId);
                            body.name.should.be.eql('old-test-project');
                            body.introduce.should.be.eql('간단소개');
                            body.images.should.be.eql(["/image1", "/image2"]);
                            body.description.should.be.eql('프로젝트 상세 설명 수정');
                            body.descriptionImages.should.be.eql(["/desc/image1", "/desc/image2"]);
                            body.status.should.be.eql("temporary");
                            body.interviewer.name.should.be.eql("혜리");
                            body.interviewer.url.should.be.eql("https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a");
                            body.interviewer.introduce.should.be.eql("툰스토리 디자이너");

                            done();
                        });
                    }).catch(err => done(err));
            });

            it('API 호출 성공시 등록한 projectId를 반환한다', done => {
                request.post('/projects')
                    .send(oldData)
                    .expect(200)
                    .then((res) => {
                        res.body.projectId.should.be.eql(oldData.projectId);
                        done();
                    }).catch(err => done(err));
            });
        });
    });

    describe('프로젝트 데이터가 등록된 상황에서', () => {
        const notMyProjectData = {
            "projectId": 1234567890,
            "customerId": "someoneId",
            "name": "not-my-project"
        };

        beforeEach(done => {
            Projects.create(oldData, () => {
                Projects.create(notMyProjectData, () => {
                    done();
                });
            });
        });

        describe('GET /projects', () => {
            it('프로젝트 목록 조회 시 본인의 프로젝트목록만 리턴한다', done => {
                request.get('/projects')
                    .expect(200)
                    .then(res => {
                        res.body.length.should.be.eql(1);
                        res.body[0].customerId.should.be.eql(config.testCustomerId);
                        done();
                    }).catch(err => done(err));
            });
        });

        describe('GET /projects', () => {
            it('본인의 데이터인 경우 프로젝트 정보를 리턴한다', done => {
                request.get('/projects/' + oldData.projectId)
                    .expect(200)
                    .then(res => {
                        res.body.length.should.be.eql(1);
                        res.body[0].projectId.should.be.eql(oldData.projectId);
                        done();
                    }).catch(err => done(err));
            });

            it('본인의 데이터가 없는 경우 컨텐츠 없음 코드(204)를 리턴한다', done => {
                request.get('/projects/' + notMyProjectData.projectId)
                    .expect(204, done);
            });
        });
    });

    describe('POST /projects/{id}/interviews', () => {
        const testInterviewData = {
            "type": '오프라인 테스트',
            "location": '향군타워 5층',
            "apps": ["com.kakao.talk", "com.nhn.android.search"],
            "openDate": '2017-11-01T00:00:00.000Z',
            "closeDate": '2017-11-02T00:00:00.000Z',
            "startDate": '2017-11-03T00:00:00.000Z',
            "endDate": '2017-11-04T00:00:00.000Z',
            "plans": [{
                "minute": 10,
                "plan": '제품소개',
            }, {
                "minute": 30,
                "plan": '인터뷰',
            }],
        };

        beforeEach(done => {
            Projects.create(oldData, () => {
                clock = sinon.useFakeTimers(new Date("2017-11-17").getTime());
                done()
            });

        });

        it('프로젝트의 인터뷰 정보를 저장한다', done => {
            request.post('/projects/' + oldData.projectId + '/interviews')
                .send(testInterviewData)
                .expect(200)
                .then(() => {
                    Projects.find({projectId: oldData.projectId}, (err, res) => {
                        const body = res[0];
                        body.interviews.length.should.be.eql(1);
                        body.interviews[0].seq.should.be.eql(1510876800000);
                        body.interviews[0].type.should.be.eql("오프라인 테스트");
                        body.interviews[0].location.should.be.eql("향군타워 5층");
                        body.interviews[0].apps.should.be.eql(["com.kakao.talk", "com.nhn.android.search"]);
                        body.interviews[0].openDate.should.be.eql(new Date("2017-11-01T00:00:00.000Z"));
                        body.interviews[0].closeDate.should.be.eql(new Date("2017-11-02T00:00:00.000Z"));
                        body.interviews[0].startDate.should.be.eql(new Date("2017-11-03T00:00:00.000Z"));
                        body.interviews[0].endDate.should.be.eql(new Date("2017-11-04T00:00:00.000Z"));
                        body.interviews[0].plans.should.be.eql([
                            {"minute": 10, "plan": "제품소개"},
                            {"minute": 30, "plan": "인터뷰"}
                        ]);

                        done();
                    });
                }).catch(err => done(err));
        });

        afterEach(done => {
            clock.restore();
            done();
        });
    });

    afterEach(done => {
        sandbox.restore();
        Projects.remove({})
            .exec()
            .then(done())
            .catch(err => done(err));
    });
});