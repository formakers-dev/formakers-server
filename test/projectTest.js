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

    const oldData = {
        "projectId": config.testProjectId,
        "customerId": config.testCustomerId,
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "apps": ["com.kakao.talk", "com.nhn.android.search"],
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
        "apps": ["com.kakao.talk", "com.nhn.android.search"],
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
                        res.body.projectId.should.exist;
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
                                body.apps.should.be.eql(["com.kakao.talk", "com.nhn.android.search"]);
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

        it('status가 registered인 경우 유사앱유저리스트를 검색해서 알림을 보낸다', (done) => {
            const userIdList = ['testUserId1', 'testUserId2'];
            const registrationIdList = ['registrationId1', 'registrationId2'];

            const stubGetUserListByPackageName = sandbox.stub(AppUsagesController, 'getUserIdsByPackageNames');
            stubGetUserListByPackageName.withArgs(oldData.apps).returns(Promise.resolve(userIdList));
            const stubGetRegistrationIds = sandbox.stub(UserController, 'getRegistrationIds');
            stubGetRegistrationIds.withArgs(sinon.match.any).returns(Promise.resolve(registrationIdList));
            const stubSendNotification = sandbox.stub(NotificationController, 'sendNotification');
            stubSendNotification.withArgs(sinon.match.any).returns(Promise.resolve());

            request.post('/projects')
                .send(newData)
                .expect(200)
                .then(() => {
                    sinon.assert.calledOnce(stubGetUserListByPackageName);
                    sinon.assert.calledWithExactly(stubSendNotification, registrationIdList);
                    done();
                }).catch(err => done(err));
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
                        expect(res.body.length).to.be.eql(1);
                        expect(res.body[0].customerId).to.be.eql(config.testCustomerId);
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
            "openDate": '20171101',
            "closeDate": '20171102',
            "startDate": '20171103',
            "endDate": '20171104',
            "plans": [{
                "minute": 10,
                "plan": '제품소개',
            }, {
                "minute": 30,
                "plan": '인터뷰',
            }],
        };

        beforeEach(done => {
            Projects.create(oldData, () => done());
        });

        it('프로젝트의 인터뷰 정보를 저장한다', done => {
            request.post('/projects/'+ oldData.projectId +'/interviews')
                .send(testInterviewData)
                .expect(200)
                .then(() => {
                    Projects.find({projectId: oldData.projectId}, (err, res) => {
                        const body = res[0];

                        body.interview.type.should.be.eql("오프라인 테스트");
                        body.interview.location.should.be.eql("향군타워 5층");
                        body.interview.openDate.should.be.eql("20171101");
                        body.interview.closeDate.should.be.eql("20171102");
                        body.interview.startDate.should.be.eql("20171103");
                        body.interview.endDate.should.be.eql("20171104");
                        body.interview.plans.should.be.eql([
                            {"minute": 10, "plan": "제품소개"},
                            {"minute": 30, "plan": "인터뷰"}
                        ]);

                        done();
                    });
                }).catch(err => done(err));
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