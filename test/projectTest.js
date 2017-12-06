const chai = require('chai');
const sinon = require('sinon');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();

const Projects = require('./../models/projects');

describe('Project', () => {
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

    beforeEach((done) => {
        server.request.isAuthenticated = () => true;
        server.request.user = config.testCustomerId;

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
            status: 'temporary',
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
                    project.status.should.be.eql('temporary');
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

            request.put('/projects/' + myData.projectId)
                .send(updatingData)
                .expect(200)
                .then(res => {
                    res.body.projectId.should.be.eql(myData.projectId);
                    return Projects.findOne({projectId: myData.projectId});
                })
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
                    res.body.length.should.be.eql(1);
                    res.body[0].projectId.should.be.eql(myData.projectId);
                    done();
                }).catch(err => done(err));
        });

        it('본인의 데이터가 아닌 경우 권한 없음 코드(401)를 리턴한다', done => {
            request.get('/projects/' + notMyData.projectId).expect(401, done);
        });
    });

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
            emergencyPhone: '010-1234-5678'
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

    afterEach(done => {
        sandbox.restore();
        Projects.remove({}, () => done());
    });
});