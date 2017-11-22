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

    const notMyData = {
        "projectId": 1234567890,
        "customerId": "someoneId",
        "name": "not-my-project"
    };

    const myData = {
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

    beforeEach((done) => {
        server.request.isAuthenticated = () => true;
        server.request.user = config.testCustomerId;

        Projects.create([myData, notMyData], () => done());
    });

    describe('POST /projects', () => {
        const newData = {
            "name": "new-test-project",
            "introduce": "new간단소개",
            "images": ["/newimage1"],
            "description": "new프로젝트 상세 설명",
            "descriptionImages": ["/desc/newimage1", "/desc/newimage2", "/desc/newimage3"],
            "status": "temporary",
            "interviewer": {
                "name": "new혜리",
                "url": "https://newUrl",
                "introduce": "new디자이너"
            }
        };

        it('projectId를 생성하고 신규 projectId를 반환한다', done => {
            request.post('/projects')
                .send(newData)
                .expect(200)
                .then((res) => Projects.findOne({projectId: res.body.projectId}).exec())
                .then(project => {
                    project.name.should.be.eql('new-test-project');
                    project.introduce.should.be.eql('new간단소개');
                    project.images.should.be.eql(["/newimage1"]);
                    project.description.should.be.eql('new프로젝트 상세 설명');
                    project.descriptionImages.should.be.eql(["/desc/newimage1", "/desc/newimage2", "/desc/newimage3"]);
                    project.status.should.be.eql("temporary");
                    project.interviewer.name.should.be.eql("new혜리");
                    project.interviewer.url.should.be.eql("https://newUrl");
                    project.interviewer.introduce.should.be.eql("new디자이너");

                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('POST /projects/{id}', () => {
        it('기존데이터를 업데이트한다', done => {
            let updatingData = myData;
            updatingData.description = '프로젝트 상세 설명 수정';

            request.post('/projects/' + myData.projectId)
                .send(updatingData)
                .expect(200)
                .then(res => {
                    res.body.projectId.should.be.eql(myData.projectId);

                    Projects.findOne({projectId: myData.projectId}, (err, project) => {
                        project.customerId.should.be.eql(myData.customerId);
                        project.name.should.be.eql('old-test-project');
                        project.introduce.should.be.eql('간단소개');
                        project.images.should.be.eql(["/image1", "/image2"]);
                        project.description.should.be.eql('프로젝트 상세 설명 수정');
                        project.descriptionImages.should.be.eql(["/desc/image1", "/desc/image2"]);
                        project.status.should.be.eql("temporary");
                        project.interviewer.name.should.be.eql("혜리");
                        project.interviewer.url.should.be.eql("https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F2dee1c60-bebf-11e7-9289-fd750bff2e2c?alt=media&token=009bbab5-0655-4038-ab20-8a3a05e29f4a");
                        project.interviewer.introduce.should.be.eql("툰스토리 디자이너");

                        done();
                    });
                }).catch(err => done(err));
        });
    });

    describe('GET /projects', () => {
        it('본인의 프로젝트 목록를 리턴한다', done => {
            request.get('/projects')
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);
                    res.body[0].customerId.should.be.eql(config.testCustomerId);
                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /projects/{id}', () => {
        it('본인의 데이터인 경우 프로젝트 정보를 리턴한다', done => {
            request.get('/projects/' + myData.projectId)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);
                    res.body[0].projectId.should.be.eql(myData.projectId);
                    done();
                }).catch(err => done(err));
        });

        it('본인의 데이터가 없는 경우 컨텐츠 없음 코드(204)를 리턴한다', done => {
            request.get('/projects/' + notMyData.projectId)
                .expect(204, done);
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

        beforeEach(() => {
            clock = sinon.useFakeTimers(new Date("2017-11-17").getTime());
        });

        it('프로젝트의 인터뷰 정보를 저장한다', done => {
            request.post('/projects/' + myData.projectId + '/interviews')
                .send(testInterviewData)
                .expect(200)
                .then(() => {
                    Projects.find({projectId: myData.projectId}, (err, res) => {
                        const body = res[0];
                        body.interviews.length.should.be.eql(1);
                        body.interviews[0].seq.should.be.eql(1510876800000);
                        body.interviews[0].type.should.be.eql("오프라인 테스트");
                        body.interviews[0].location.should.be.eql("향군타워 5층");
                        body.interviews[0].apps.should.be.eql(["com.kakao.talk", "com.nhn.android.search"]);
                        body.interviews[0].openDate.should.be.eql(new Date("2017-11-01T00:00:00.000Z"));
                        body.interviews[0].closeDate.should.be.eql(new Date("2017-11-02T23:59:59.999Z"));
                        body.interviews[0].startDate.should.be.eql(new Date("2017-11-03T00:00:00.000Z"));
                        body.interviews[0].endDate.should.be.eql(new Date("2017-11-04T00:00:00.000Z"));
                        body.interviews[0].totalCount.should.be.eql(5);
                        body.interviews[0].plans.should.be.eql([
                            {"minute": 10, "plan": "제품소개"},
                            {"minute": 30, "plan": "인터뷰"}
                        ]);

                        done();
                    });
                }).catch(err => done(err));
        });

        afterEach(() => {
            clock.restore();
        });
    });

    afterEach(done => {
        sandbox.restore();
        Projects.remove({}, () => done());
    });
});