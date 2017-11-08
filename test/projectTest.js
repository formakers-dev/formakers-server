const chai = require('chai');
const sinon = require('sinon');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const expect = chai.expect;

const Projects = require('./../models/projects');
const AppUsagesController = require('./../controllers/appUsages');
const NotificationController = require('./../controllers/notification');
const UserController = require('./../controllers/user');

describe('Project', () => {
    const sandbox = sinon.sandbox.create();

    const temporaryData = {
        "projectId": config.testProjectId,
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "apps": ["com.kakao.talk", "com.nhn.android.search"],
        "description": "프로젝트 상세 설명",
        "descriptionImages": ["/desc/image1", "/desc/image2"],
        "interview": {
            "type": 1,
            "location_negotiable": false,
            "location": "향군타워 5층",
            "openDate": "20171011",
            "closeDate": "20171016",
            "dateNegotiable": false,
            "startDate": "20171101",
            "endDate": "20171131",
            "plans": [{"minute": 10, "plan": "제품 소개"}, {"minute": 30, "plan": "테스트진행"}, {
                "minute": 20,
                "plan": "피드백"
            }]
        },
        "status": "temporary",
        "interviewer": {
            "name": "혜리",
            "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a",
            "introduce": "툰스토리 디자이너"
        }
    };

    const registeredData = {
        "projectId": config.testProjectId,
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "apps": ["com.kakao.talk", "com.nhn.android.search"],
        "description": "프로젝트 상세 설명",
        "descriptionImages": ["/desc/image1", "/desc/image2"],
        "interview": {
            "type": 1,
            "locationNegotiable": false,
            "location": "향군타워 5층",
            "openDate": "20171011",
            "closeDate": "20171016",
            "dateNegotiable": false,
            "startDate": "20171101",
            "endDate": "20171131",
            "plans": [{"minute": 10, "plan": "제품 소개"}, {"minute": 30, "plan": "테스트진행"}, {
                "minute": 20,
                "plan": "피드백"
            }]
        },
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

    describe('POST /project', () => {
        describe('신규 데이터인 경우 테스트', () => {
            it('신규입력일 경우 projectId를 생성하여 저장한다', done => {
                request.post('/project')
                    .send(temporaryData)
                    .expect(200)
                    .then(done());
            });
        });

        describe('기존 데이터인 경우 테스트', () => {
            temporaryData.description = '프로젝트 상세 설명 수정';

            beforeEach(done => {
                Projects.create(temporaryData, () => done());
            });

            it('기존데이터일 경우 업데이트한다', done => {
                request.post('/project')
                    .send(temporaryData)
                    .expect(200)
                    .end(() => {
                        Projects.find({$and: [{projectId: temporaryData.projectId}]}, (err, res) => {
                                const body = res[0];
                                body.projectId.should.be.eql(config.testProjectId);
                                body.customerId.should.be.eql(config.testCustomerId);
                                body.name.should.be.eql('old-test-project');
                                body.introduce.should.be.eql('간단소개');
                                body.images.should.be.eql(["/image1", "/image2"]);
                                body.apps.should.be.eql(["com.kakao.talk", "com.nhn.android.search"]);
                                body.description.should.be.eql('프로젝트 상세 설명 수정');
                                body.descriptionImages.should.be.eql(["/desc/image1", "/desc/image2"]);
                                body.interview.type.should.be.eql(1);
                                body.interview.location_negotiable.should.be.eql(false);
                                body.interview.location.should.be.eql("향군타워 5층");
                                body.interview.openDate.should.be.eql("20171011");
                                body.interview.closeDate.should.be.eql("20171016");
                                body.interview.dateNegotiable.should.be.eql(false);
                                body.interview.startDate.should.be.eql("20171101");
                                body.interview.endDate.should.be.eql("20171131");
                                body.interview.plans.should.be.eql([
                                    {"minute": 10, "plan": "제품 소개"},
                                    {"minute": 30, "plan": "테스트진행"},
                                    {"minute": 20, "plan": "피드백"}
                                ]);
                                body.status.should.be.eql("temporary");
                                body.interviewer.name.should.be.eql("혜리");
                                body.interviewer.url.should.be.eql("https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a");
                                body.interviewer.introduce.should.be.eql("툰스토리 디자이너");

                                done();
                            });
                    });
            });
        });

        it('status가 registered인 경우 유사앱유저리스트를 검색해서 알림을 보낸다', (done) => {
            const userIdList = ['testUserId1', 'testUserId2'];
            const registrationIdList = ['registrationId1', 'registrationId2'];

            const stubGetUserListByPackageName = sandbox.stub(AppUsagesController, 'getUserIdsByPackageNames');
            stubGetUserListByPackageName.withArgs(temporaryData.apps).returns(Promise.resolve(userIdList));
            const stubGetRegistrationIds = sandbox.stub(UserController, 'getRegistrationIds');
            stubGetRegistrationIds.withArgs(sinon.match.any).returns(Promise.resolve(registrationIdList));
            const stubSendNotification = sandbox.stub(NotificationController, 'sendNotification');
            stubSendNotification.withArgs(sinon.match.any).returns(Promise.resolve());

            request.post('/project')
                .send(registeredData)
                .expect(200)
                .end(() => {
                    sinon.assert.calledOnce(stubGetUserListByPackageName);
                    sinon.assert.calledWithExactly(stubSendNotification, registrationIdList);
                    done();
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
            Projects.create(temporaryData, () => {
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
                request.get('/project?projectId=' + temporaryData.projectId)
                    .expect(200)
                    .end((err, res) => {
                        res.body.length.should.be.eql(1);
                        res.body[0].projectId.should.be.eql(temporaryData.projectId);
                        done();
                    });
            });

            it('본인의 데이터가 아닌 경우 서버 오류를 리턴한다', done => {
                request.get('/project?projectId=' + temporaryData.projectId)
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
        sandbox.restore();

        Projects.remove({customerId: temporaryData.customerId})
            .exec()
            .then(done());
    });
});