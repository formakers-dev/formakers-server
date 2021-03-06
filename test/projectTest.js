const chai = require('chai');
const sinon = require('sinon');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const Projects = require('./../models/projects');
const setupTestMiddleware = require('./setupTestMiddleware');

describe.skip('Project', () => {
    const sandbox = sinon.sandbox.create();

    const notMyData = {
        projectId: 1234567890,
        customerId: 'someoneId',
        name: 'not-my-project'
    };

    const myData = {
        projectId: config.testProjectId,
        customerId: config.testCustomerId,
        name: 'old-test-project',
        introduce: '간단소개',
        image: {
            name: 'image1',
            url: '/image1'
        },
        description: '프로젝트 상세 설명',
        descriptionImages: [{
            name: 'descImage1',
            url: '/desc/image1'
        }, {
            name: 'descImage2',
            url: '/desc/image2'
        }],
        status: 'temporary',
        interviews: [],
        owner: {
            name: '혜리',
            image: {
                name: 'toonImage',
                url: 'https://toonStoryUrl'
            },
            introduce: '툰스토리 디자이너'
        },
        videoUrl: 'www.video.com'
    };

    before(done => setupTestMiddleware.setupNormalAuth(server.request, done));

    beforeEach((done) => {
        Projects.create([myData, notMyData], () => done());
    });

    describe('POST /projects', () => {
        const newData = {
            name: 'new-test-project',
            introduce: 'new간단소개',
            image: {
                name: 'newImage1',
                url: '/newimage1'
            },
            description: 'new프로젝트 상세 설명',
            descriptionImages: [{
                name: 'descNewImage1',
                url: '/desc/newimage1'
            }, {
                name: 'descNewImage2',
                url: '/desc/newimage2'
            }, {
                name: 'descNewImage3',
                url: '/desc/newimage3'
            }],
            owner: {
                name: 'new혜리',
                image: {
                    name: 'newUrl',
                    url: 'https://newUrl',
                },
                introduce: 'new디자이너'
            },
            videoUrl: 'new.video.com'
        };

        it('projectId를 생성하고 신규 projectId를 반환한다', done => {
            request.post('/projects')
                .send(newData)
                .expect(200)
                .then((res) => Projects.findOne({projectId: res.body.projectId}).exec())
                .then(project => {
                    project.name.should.be.eql('new-test-project');
                    project.introduce.should.be.eql('new간단소개');
                    project.image.name.should.be.eql('newImage1');
                    project.image.url.should.be.eql('/newimage1');
                    project.description.should.be.eql('new프로젝트 상세 설명');
                    project.descriptionImages.length.should.be.eql(3);
                    project.descriptionImages[0].name.should.be.eql('descNewImage1');
                    project.descriptionImages[0].url.should.be.eql('/desc/newimage1');
                    project.descriptionImages[1].name.should.be.eql('descNewImage2');
                    project.descriptionImages[1].url.should.be.eql('/desc/newimage2');
                    project.descriptionImages[2].name.should.be.eql('descNewImage3');
                    project.descriptionImages[2].url.should.be.eql('/desc/newimage3');
                    project.status.should.be.eql('registered');
                    project.owner.name.should.be.eql('new혜리');
                    project.owner.image.name.should.be.eql('newUrl');
                    project.owner.image.url.should.be.eql('https://newUrl');
                    project.owner.introduce.should.be.eql('new디자이너');
                    project.videoUrl.should.be.eql('new.video.com');

                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('PUT /projects/{id}', () => {
        it('기존데이터를 업데이트한다', done => {
            let updatingData = myData;
            updatingData.description = '프로젝트 상세 설명 수정';
            updatingData.status = '';

            request.put('/projects/' + myData.projectId)
                .send(updatingData)
                .expect(200)
                .then(() => Projects.findOne({projectId: myData.projectId}))
                .then(project => {
                    project.customerId.should.be.eql(myData.customerId);
                    project.name.should.be.eql('old-test-project');
                    project.introduce.should.be.eql('간단소개');
                    project.image.name.should.be.eql('image1');
                    project.image.url.should.be.eql('/image1');
                    project.description.should.be.eql('프로젝트 상세 설명 수정');

                    project.descriptionImages.length.should.be.eql(2);
                    project.descriptionImages[0].name.should.be.eql('descImage1');
                    project.descriptionImages[0].url.should.be.eql('/desc/image1');
                    project.descriptionImages[1].name.should.be.eql('descImage2');
                    project.descriptionImages[1].url.should.be.eql('/desc/image2');
                    project.status.should.be.eql('temporary');
                    project.owner.name.should.be.eql('혜리');
                    project.owner.image.name.should.be.eql('toonImage');
                    project.owner.image.url.should.be.eql('https://toonStoryUrl');
                    project.owner.introduce.should.be.eql('툰스토리 디자이너');

                    project.interviews.length.should.be.eql(0);

                    done();
                }).catch(err => done(err));
        });

        it('본인의 데이터가 아닌 경우 권한 없음 코드(401)를 리턴한다', done => {
            request.put('/projects/' + notMyData.projectId)
                .send({})
                .expect(401, done);
        });
    });

    describe('GET /projects', () => {
        const myData2 = {
            projectId: 10000000000,
            customerId: config.testCustomerId,
            name: 'old-test-project2',
            introduce: '간단소개2',
            image: {
                name: 'image2',
                url: '/image2'
            },
            description: '프로젝트 상세 설명2',
            descriptionImages: [{
                name: 'descImage12',
                url: '/desc/image12'
            }, {
                name: 'descImage22',
                url: '/desc/image22'
            }],
            status: 'temporary',
            owner: {
                name: '혜리2',
                image: {
                    name: 'toonImage2',
                    url: 'https://toonStoryUrl2'
                },
                introduce: '툰스토리 디자이너2'
            },
            videoUrl: 'www.video.com2'
        };

        beforeEach((done) => {
            Projects.create(myData2, done);
        });

        it('본인의 프로젝트 목록를 프로젝트ID역순으로 리턴한다', done => {
            request.get('/projects')
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);
                    res.body[0].customerId.should.be.eql(config.testCustomerId);
                    res.body[0].projectId.should.be.eql(10000000000);
                    res.body[1].customerId.should.be.eql(config.testCustomerId);
                    res.body[1].projectId.should.be.eql(config.testProjectId);
                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /projects/{id}', () => {
        it('본인의 데이터인 경우 프로젝트 정보를 리턴한다', done => {
            request.get('/projects/' + myData.projectId)
                .expect(200)
                .then(res => {
                    res.body.projectId.should.be.eql(myData.projectId);
                    done();
                }).catch(err => done(err));
        });

        it('본인의 데이터가 아닌 경우 권한 없음 코드(401)를 리턴한다', done => {
            request.get('/projects/' + notMyData.projectId).expect(401, done);
        });
    });

    describe('인터뷰 관련 테스트', () => {
        describe('POST /projects/{id}/interviews', () => {
            const testInterviewData = {
                type: '오프라인 테스트',
                introduce: '인터뷰 소개',
                location: '향군타워 5층',
                locationDescription: '여기서봐요...',
                apps: [{
                    packageName: 'com.kakao.talk',
                    appName: '카카오톡'
                }, {
                    packageName: 'com.nhn.android.search',
                    appName: '네이버검색'
                }],
                openDate: 1509462000000,         //2017-11-01 00:00:00.000 KST
                closeDate: 1509634799999,        //2017-11-02 23:59:59.999 KST
                interviewDate: 1509721199999,    //2017-11-03 23:59:59.999 KST
                timeSlotTimes: [6, 7, 13],
                emergencyPhone: '010-1234-5678',
                rewards: '커피 쿠폰 3만원'
            };

            it('프로젝트의 인터뷰 정보를 저장한다', done => {
                request.post('/projects/' + myData.projectId + '/interviews')
                    .send(testInterviewData)
                    .expect(200)
                    .then(res => {
                        res.body.interviewSeq.should.be.eql(1);
                        return Projects.findOne({projectId: myData.projectId}).exec();
                    })
                    .then(project => {
                        project.interviews.length.should.be.eql(1);

                        const interview = project.interviews[0];
                        interview.seq.should.be.eql(1);
                        interview.type.should.be.eql('오프라인 테스트');
                        interview.introduce.should.be.eql('인터뷰 소개');
                        interview.location.should.be.eql('향군타워 5층');
                        interview.locationDescription.should.be.eql('여기서봐요...');
                        interview.apps[0].packageName.should.be.eql('com.kakao.talk');
                        interview.apps[0].appName.should.be.eql('카카오톡');
                        interview.apps[1].packageName.should.be.eql('com.nhn.android.search');
                        interview.apps[1].appName.should.be.eql('네이버검색');
                        // 한국시간 기준 새벽 0시와 23:59:59:999 세팅
                        interview.openDate.should.be.eql(new Date('2017-10-31T15:00:00.000Z'));
                        interview.closeDate.should.be.eql(new Date('2017-11-02T14:59:59.999Z'));
                        interview.interviewDate.should.be.eql(new Date('2017-11-03T14:59:59.999Z'));
                        interview.totalCount.should.be.eql(5);
                        interview.timeSlot.should.be.eql({
                            'time6': '',
                            'time7': '',
                            'time13': ''
                        });
                        interview.emergencyPhone.should.be.eql('010-1234-5678');
                        interview.rewards.should.be.eql('커피 쿠폰 3만원');

                        done();
                    })
                    .catch(err => done(err));
            });

            describe('기존 인터뷰 정보가 존재하는 상황에서', () => {
                beforeEach(done => {
                    request.post('/projects/' + myData.projectId + '/interviews')
                        .send(testInterviewData)
                        .expect(200, done);
                });

                it('인터뷰 순번이 1만큼 증가되어 정보를 저장한다', done => {
                    request.post('/projects/' + myData.projectId + '/interviews')
                        .send(testInterviewData)
                        .expect(200)
                        .then(res => {
                            res.body.interviewSeq.should.be.eql(2);
                            return Projects.findOne({projectId: myData.projectId}).exec();
                        })
                        .then(project => {
                            project.interviews.length.should.be.eql(2);
                            project.interviews[0].seq.should.be.eql(1);
                            project.interviews[1].seq.should.be.eql(2);
                            done();
                        })
                        .catch(err => done(err));
                });
            });

            it('본인의 데이터가 아닌 경우 권한 없음 코드(401)를 리턴한다', done => {
                request.post('/projects/' + notMyData.projectId + '/interviews')
                    .send({})
                    .expect(401, done);
            });
        });

        const myInterviewData = {
            projectId: 55555,
            customerId: config.testCustomerId,
            name: '인터뷰-조회용-project',
            introduce: '간단소개',
            image: {
                name: 'image1',
                url: '/image1'
            },
            description: '프로젝트 상세 설명',
            descriptionImages: [{
                name: 'descImage1',
                url: '/desc/image1'
            }, {
                name: 'descImage2',
                url: '/desc/image2'
            }],
            status: 'registered',
            owner: {
                name: '혜리',
                image: {
                    name: 'toonImage',
                    url: 'https://toonStoryUrl'
                },
                introduce: '툰스토리 디자이너'
            },
            videoUrl: 'www.video.com',
            interviews: [
                {
                    "timeSlot": {
                        "time6": "",
                        "time7": "",
                        "time8": "",
                        "time9": "",
                        "time10": ""
                    },
                    "totalCount": 5,
                    "emergencyPhone": "010-119-119",
                    "openDate": 1509462000000,         //2017-11-01 00:00:00.000 KST
                    "closeDate": 1509634799999,        //2017-11-02 23:59:59.999 KST
                    "interviewDate": 1509721199999,    //2017-11-03 23:59:59.999 KST
                    "locationDescription": "수원사업장으로 오세요",
                    "location": "수원 사업장",
                    "type": "오프라인 인터뷰",
                    "seq": 1,
                    "notifiedUserIds": [],
                    "apps": [
                        {
                            "packageName": "com.google.android.gm",
                            "appName": "Gmail"
                        }
                    ],
                    "rewards": "커피 쿠폰 1만원"
                },
                {
                    "timeSlot": {
                        "time11": "",
                        "time12": "",
                        "time13": "",
                        "time14": "",
                        "time15": ""
                    },
                    "totalCount": 5,
                    "emergencyPhone": "010-119-1192",
                    "openDate": 1509462000000,         //2017-11-01 00:00:00.000 KST
                    "closeDate": 1509634799999,        //2017-11-02 23:59:59.999 KST
                    "interviewDate": 1509721199999,    //2017-11-03 23:59:59.999 KST
                    "locationDescription": "수원사업장으로 오세요2",
                    "location": "수원 사업장2",
                    "type": "오프라인 인터뷰",
                    "seq": 2,
                    "notifiedUserIds": [
                    ],
                    "apps": [
                        {
                            "packageName": "com.google.android.gm2",
                            "appName": "Gmail2"
                        }
                    ],
                    "rewards": "커피 쿠폰 2만원"
                },
                {
                    "timeSlot": {
                        "time16": "",
                        "time17": "",
                        "time18": "",
                        "time19": "",
                        "time20": ""
                    },
                    "totalCount": 5,
                    "emergencyPhone": "010-119-1193",
                    "openDate": 1509462000000,         //2017-11-01 00:00:00.000 KST
                    "closeDate": 1509634799999,        //2017-11-02 23:59:59.999 KST
                    "interviewDate": 1509721199999,    //2017-11-03 23:59:59.999 KST
                    "locationDescription": "수원사업장으로 오세요3",
                    "location": "수원 사업장3",
                    "type": "오프라인 인터뷰",
                    "seq": 3,
                    "notifiedUserIds": [],
                    "apps": [
                        {
                            "packageName": "com.google.android.gm3",
                            "appName": "Gmail3"
                        }
                    ],
                    "rewards": "커피 쿠폰 3만원"
                }
            ],
        };

        const notMyInterviewData = {
            projectId: 4564566,
            customerId: 'someoneId',
            name: 'not-my-project',
            interviews: [
                {
                    "timeSlot": {
                        "time6": "",
                        "time7": "",
                        "time8": "google110897406327517511196",
                        "time9": "google112909653374339401399",
                        "time10": ""
                    },
                    "totalCount": 5,
                    "emergencyPhone": "010-119-119",
                    "openDate": 1509462000000,         //2017-11-01 00:00:00.000 KST
                    "closeDate": 1509634799999,        //2017-11-02 23:59:59.999 KST
                    "interviewDate": 1509721199999,    //2017-11-03 23:59:59.999 KST
                    "locationDescription": "수원사업장으로 오세요",
                    "location": "수원 사업장",
                    "type": "오프라인 인터뷰",
                    "seq": 1,
                    "notifiedUserIds": [
                        "google112909653374339401399",
                        "112909653374339401399",
                        "116136954630190256240",
                        "google116136954630190256240",
                        "google110997368786962641889",
                        "google110897406327517511196",
                        "110897406327517511196",
                        "109974316241227718963"
                    ],
                    "apps": [
                        {
                            "packageName": "com.google.android.gm",
                            "appName": "Gmail"
                        }
                    ],
                    "rewards": "커피 쿠폰 4만원"
                }
            ],
        };

        describe('GET /projects/:id/interviews/:seq', () => {
            beforeEach((done) => {
                Projects.create([myInterviewData, notMyInterviewData], done);
            });

            it('본인이 작성한 데이터인 경우 해당 프로젝트의 인터뷰 정보를 조회한다', done => {
                request.get('/projects/' + myInterviewData.projectId + '/interviews/1')
                    .expect(200)
                    .then(res => {
                        res.body.interviews.location.should.be.eql("수원 사업장");
                        res.body.interviews.locationDescription.should.be.eql("수원사업장으로 오세요");
                        res.body.interviews.openDate.should.be.eql("2017-10-31T15:00:00.000Z");
                        res.body.interviews.closeDate.should.be.eql("2017-11-02T14:59:59.999Z");
                        res.body.interviews.interviewDate.should.be.eql("2017-11-03T14:59:59.999Z");
                        res.body.interviews.apps[0].packageName.should.be.eql("com.google.android.gm");
                        res.body.interviews.apps[0].appName.should.be.eql("Gmail");
                        res.body.interviews.emergencyPhone.should.be.eql("010-119-119");
                        res.body.interviews.timeSlot.time6.should.be.eql("");
                        res.body.interviews.timeSlot.time7.should.be.eql("");
                        res.body.interviews.timeSlot.time8.should.be.eql("");
                        res.body.interviews.timeSlot.time9.should.be.eql("");
                        res.body.interviews.timeSlot.time10.should.be.eql("");
                        res.body.interviews.totalCount.should.be.eql(5);
                        res.body.interviews.rewards.should.be.eql('커피 쿠폰 1만원');
                        done();
                    }).catch(err => done(err));
            });

            it('본인이 작성하지 않은 데이터인 경우 권한 없음 코드(401)를 리턴한다', done => {
                request.get('/projects/' + notMyInterviewData.projectId + '/interviews/1')
                    .expect(401, done);
            });
        });

        describe('PUT /projects/:id/interviews/:seq', () => {
            let clock;
            const updateInterviewData = {
                type: '온라인 테스트',
                introduce: '인터뷰 소개 수정',
                location: '우면캠퍼스',
                locationDescription: '수정된 곳으로 오세요',
                apps: [{
                    packageName: 'com.kakao.talk',
                    appName: '카카오톡'
                }, {
                    packageName: 'com.nhn.android.search',
                    appName: '네이버검색'
                }],
                openDate: 1512054000000,         //2017-12-01 00:00:00.000 KST
                closeDate: 1512313199000,        //2017-12-03 23:59:59.999 KST
                interviewDate: 1512399599000,    //2017-12-04 23:59:59.999 KST
                timeSlotTimes: [7, 11],
                emergencyPhone: '010-9999-7777',
                rewards: '커피 쿠폰 10만원',
            };

            beforeEach((done) => {
                clock = sandbox.useFakeTimers(new Date("2017-10-29").getTime());
                Projects.create([myInterviewData, notMyInterviewData], done);
            });

            it('기존 인터뷰 데이터를 수정 저장한다', (done) => {
                request.put('/projects/' + myInterviewData.projectId + '/interviews/2')
                    .send(updateInterviewData)
                    .expect(200)
                    .then(() => Projects.findOne({projectId: myInterviewData.projectId}).sort({'interviews.seq': 1}))
                    .then(project => {
                        const interview = project.interviews[1];
                        // immutable data
                        interview.seq.should.be.eql(2);
                        interview.totalCount.should.be.eql(5);
                        interview.notifiedUserIds.should.be.eql([]);
                        // updated data
                        interview.type.should.be.eql('온라인 테스트');
                        interview.introduce.should.be.eql('인터뷰 소개 수정');
                        interview.location.should.be.eql('우면캠퍼스');
                        interview.locationDescription.should.be.eql('수정된 곳으로 오세요');
                        interview.apps.length.should.be.eql(2);
                        interview.apps[0].packageName.should.be.eql('com.kakao.talk');
                        interview.apps[0].appName.should.be.eql('카카오톡');
                        interview.apps[1].packageName.should.be.eql('com.nhn.android.search');
                        interview.apps[1].appName.should.be.eql('네이버검색');
                        interview.openDate.should.be.eql(new Date("2017-11-30T15:00:00.000Z"));
                        interview.closeDate.should.be.eql(new Date("2017-12-03T14:59:59.000Z"));
                        interview.interviewDate.should.be.eql(new Date("2017-12-04T14:59:59.000Z"));
                        interview.timeSlot.should.be.eql({
                            'time7': '',
                            'time11': ''
                        });
                        interview.emergencyPhone.should.be.eql('010-9999-7777');
                        interview.rewards.should.be.eql('커피 쿠폰 10만원');
                        done();
                    })
                    .catch(err => done(err));
            });

            it('인터뷰 모집 시작된 상태에서 저장시 사전 조건 실패 코드(412)를 리턴한다', done => {
                clock = sandbox.useFakeTimers(new Date("2017-11-02").getTime());

                request.put('/projects/' + myInterviewData.projectId + '/interviews/2')
                    .send(updateInterviewData)
                    .expect(412, done);
            });

            it('본인이 작성하지 않은 데이터인 경우 권한 없음 코드(401)를 리턴한다', done => {
                request.put('/projects/' + notMyInterviewData.projectId + '/interviews/1')
                    .send(updateInterviewData)
                    .expect(401, done);
            });

            afterEach(() => clock.restore());
        });

    });

    afterEach(done => {
        sandbox.restore();
        Projects.remove({}, () => done());
    });

    after(done => setupTestMiddleware.clearAuthSetup(done));
});
