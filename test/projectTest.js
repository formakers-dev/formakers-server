const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const expect = chai.expect;

const Projects = require('./../models/projects');

describe('Project', () => {
    describe('POST /project', () => {
        describe('신규 데이터인 경우 테스트', () => {
            const newData = {
                "customerId": config.testCustomerId,
                "name": "new-test-project",
                "introduce": "간단소개",
                "images": ["/image1", "/image2"],
                "apps": ["com.kakao.talk"],
                "interviewer_introduce": "인터뷰 진행자 소개",
                "description": "프로젝트 상세 설명",
                "description_images": ["/desc/image1", "/desc/image2"],
                "interview": {
                    "type": 1,
                    "location_negotiable": false,
                    "location": "잠실역 스벅",
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
            it('신규입력일 경우 projectId를 생성하여 저장한다', done => {
                request.post('/project')
                    .send(newData)
                    .expect(200)
                    .then(done());
            });

            afterEach('테스트 후 데이터 삭제', done => {
                Projects.remove({name : 'new-test-project'})
                    .exec()
                    .then(done());
            })

        });

        describe('기존 데이터인 경우 테스트', () => {
            const oldData = {
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

            let modifiedData = oldData;
            modifiedData.description = '프로젝트 상세 설명 수정';

            it('기존데이터일 경우 업데이트한다', done => {
                request.post('/project')
                    .send(modifiedData)
                    .expect(200)
                    .then(() => {
                        Projects.find({$and: [{customerId: oldData.customerId}, {projectId: oldData.projectId}]})
                            .then((res) => {
                                res[0].description.should.be.eql('프로젝트 상세 설명 수정');
                                done();
                            });
                    })
            });

            afterEach('테스트 후 데이터 원', done => {
                Projects.findOneAndUpdate({$and: [{projectId: oldData.projectId}, {customerId: oldData.customerId}]}, { $set: oldData }, {upsert: true})
                    .exec()
                    .then(done());
            })
        });
    });

    describe('GET /projects', () => {
        beforeEach('테스트 전 데이터 삭제', done => {
            Projects.remove({name : 'new-test-project'})
                .exec()
                .then(done());
        });

        it('프로젝트 목록 조회', done => {
            request.get('/projects')
                .expect(200)
                .end((err, res) => {
                    res.body.length.should.be.eql(4);
                    expect(res.body[0]).has.property('projectId');
                    expect(res.body[0]).has.property('customerId');
                    expect(res.body[0]).has.property('name');
                    expect(res.body[0]).has.property('introduce');
                    expect(res.body[0]).has.property('images');
                    expect(res.body[0]).has.property('apps');
                    expect(res.body[0]).has.property('interviewer_introduce');
                    expect(res.body[0]).has.property('description');
                    expect(res.body[0]).has.property('description_images');
                    expect(res.body[0]).has.property('interview');
                    expect(res.body[0].interview).has.property('type');
                    expect(res.body[0].interview).has.property('location_negotiable');
                    expect(res.body[0].interview).has.property('location');
                    expect(res.body[0].interview).has.property('open_date');
                    expect(res.body[0].interview).has.property('close_date');
                    expect(res.body[0].interview).has.property('date_negotiable');
                    expect(res.body[0].interview).has.property('start_date');
                    expect(res.body[0].interview).has.property('end_date');
                    expect(res.body[0].interview).has.property('plans');
                    expect(res.body[0].interview.plans[0]).has.property('minute');
                    expect(res.body[0].interview.plans[0]).has.property('plan');
                    expect(res.body[0]).has.property('status');
                    done();
                });
        });
    });

    describe('GET /project', () => {
        beforeEach('테스트 전 데이터 삭제', done => {
            Projects.remove({name : 'new-test-project'})
                .exec()
                .then(done());
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
});