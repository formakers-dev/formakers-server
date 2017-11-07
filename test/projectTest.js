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

describe('Project', () => {
    const sandbox = sinon.sandbox.create();

    const data = {
        "projectId": config.testProjectId,
        "name": "old-test-project",
        "introduce": "간단소개",
        "images": ["/image1", "/image2"],
        "apps": ["com.kakao.talk"],
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
        "status": "temporary",
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
                    .end(() => {
                        Projects.find({$and: [{projectId: data.projectId}]}, (err, res) => {
                                const body = res[0];
                                body.projectId.should.be.eql(config.testProjectId);
                                body.customerId.should.be.eql(config.testCustomerId);
                                body.name.should.be.eql('old-test-project');
                                body.introduce.should.be.eql('간단소개');
                                body.images.should.be.eql(["/image1", "/image2"]);
                                body.apps.should.be.eql(["com.kakao.talk"]);
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
                                body.interviewer.name.should.be.eql("혜리");
                                body.interviewer.url.should.be.eql("https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a");
                                body.interviewer.introduce.should.be.eql("툰스토리 디자이너");

                                done();
                            });
                    });
            });
        });

        it('status가 registered인 경우 유사앱유저리스트를 검색해서 알림을 보낸다', (done) => {
            data.status = 'registered';

            const stubGetUserListByPackageName = sandbox.stub(AppUsagesController, 'getUserListByPackageName');
            const registrationIdList = [ 'registrationId1', 'registrationId2' ];
            stubGetUserListByPackageName.withArgs(data.apps[0]).returns(Promise.resolve(registrationIdList));

            const stubSendNotification = sandbox.stub(NotificationController, 'sendNotification');
            stubSendNotification.withArgs(sinon.match.any).returns(Promise.resolve());


            request.post('/project')
                .send(data)
                .expect(200)
                .end(() => {
                    sinon.assert.calledOnce(stubGetUserListByPackageName);
                    sinon.assert.calledWithExactly(stubSendNotification, registrationIdList);
                    done();
                })
        });

        it('status가 registered이고 유사앱유저의 registrationId가 없는 경우 알림을 보내지 않는다', (done) => {
            data.status = 'registered';

            const stubGetUserListByPackageName = sandbox.stub(AppUsagesController, 'getUserListByPackageName');
            const registrationIdList = [];
            stubGetUserListByPackageName.withArgs(data.apps[0]).returns(Promise.resolve(registrationIdList));
            const spyOnSendNotification = sandbox.spy(NotificationController, 'sendNotification');
            request.post('/project')
                .send(data)
                .expect(200)
                .end(() => {
                    sinon.assert.calledOnce(stubGetUserListByPackageName);
                    sinon.assert.notCalled(spyOnSendNotification);
                    done();
                })
        });

        it('status가 registered가 아닌 경우 유저리스트를 검색하지 않고, 알림을 보내지 않는다.', (done) => {
            data.status = 'temporary';

            const spyOnGetUserListByPackageName = sandbox.spy(AppUsagesController, 'getUserListByPackageName');
            const spyOnSendNotification = sandbox.spy(NotificationController, 'sendNotification');

            request.post('/project')
                .send(data)
                .expect(200)
                .end(() => {
                    sinon.assert.notCalled(spyOnGetUserListByPackageName);
                    sinon.assert.notCalled(spyOnSendNotification);
                    done();
                })
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
        sandbox.restore();

        Projects.remove({customerId: data.customerId})
            .exec()
            .then(done());
    });
});