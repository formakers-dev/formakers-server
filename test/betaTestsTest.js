const chai = require('chai');
const should = chai.should();
const bcrypt = require('bcryptjs');
const server = require('../server');
const request = require('supertest').agent(server);
const config = require('../config');
const Customers = require('../models/customers');
const BetaTests = require('../models/betaTests');
const Missions = require('../models/missions');
const setupTestMiddleware = require('./setupTestMiddleware');
const ObjectId = require('mongoose').Types.ObjectId;


describe('BetaTests', () => {

  describe('GET /beta-tests', () => {

    beforeEach(done => {
      const betaTests = [
        {
          _id: ObjectId("5f28cfae73f6d2001745886c"),
          "openDate" : new Date("2020-08-04T00:00:00.306Z"),
          "closeDate" : new Date("2020-08-14T14:59:59.000Z"),
          "title" : "[숫자야구] 게임 테스트",
          "coverImageUrl" : "https://i.imgur.com/XQGrp7g.jpg",
          "customerId" : config.testUser._id,
        },
        {
          _id: ObjectId("5f28cfae73f6d2001745886b"),
          "openDate" : new Date("2020-08-01T00:00:00.306Z"),
          "closeDate" : new Date("2020-08-15T14:59:59.000Z"),
          "title" : "게임 테스트2",
          "coverImageUrl" : "https://i.imgur.com/1234.jpg",
          "customerId" : ObjectId("5f28cfae73f6d2001745aaaa"), // otherUser
        },
        {
          _id: ObjectId("5f28cfae73f6d2001745886a"),
          "openDate" : new Date("2020-12-04T00:00:00.306Z"),
          "closeDate" : new Date("2020-12-14T14:59:59.000Z"),
          "title" : "꿀잼게임",
          "coverImageUrl" : "https://i.imgur.com/XQGrp7g11jpg",
          "customerId" : config.testUser._id,
        }
      ];

      Customers.create(config.testUser)
        .then(() => BetaTests.create(betaTests))
        .then(() => done())
        .catch(err => done(err));
    });

    it('요청한 고객의 베타테스트 의뢰 목록을 반환한다', done => {

      request.get('/beta-tests')
        .set('x-access-token', config.accessToken.valid)
        .expect(200)
        .then(res => {

          res.body.length.should.be.eql(2);
          const betaTests = res.body.sort((a, b) => a._id.toString() > b._id.toString() ? 1 : -1);

          // res.body[0]._id.should.be.eql("5f28cfae73f6d2001745886a");
          betaTests[0].title.should.be.eql("꿀잼게임");
          betaTests[0].openDate.should.be.eql("2020-12-04T00:00:00.306Z");
          betaTests[0].closeDate.should.be.eql("2020-12-14T14:59:59.000Z");
          betaTests[0].coverImageUrl.should.be.eql("https://i.imgur.com/XQGrp7g11jpg");
          betaTests[0].customerId.should.be.eql(config.testUser._id);

          betaTests[1].title.should.be.eql("[숫자야구] 게임 테스트");
          betaTests[1].openDate.should.be.eql("2020-08-04T00:00:00.306Z");
          betaTests[1].closeDate.should.be.eql("2020-08-14T14:59:59.000Z");
          betaTests[1].coverImageUrl.should.be.eql( "https://i.imgur.com/XQGrp7g.jpg");
          betaTests[1].customerId.should.be.eql(config.testUser._id);

          done();
        })
        .catch(err => done(err));
    });

    describe("요청한 고객의 베타테스트 의뢰 목록이 없으면", () => {
      beforeEach(done => {
        BetaTests.remove({ customerId: config.testUser._id })
          .then(() => done())
          .catch(err => done(err));
      });

      it("204를 반환한다", done => {
        request.get('/beta-tests')
          .set('x-access-token', config.accessToken.valid)
          .expect(204, done);
      });
    });


    afterEach(done => {
      Customers.remove({})
        .then(() => BetaTests.remove({}))
        .then(() => done())
        .catch(err => done(err));
    });
  });

  describe('GET /beta-tests/:testId', () => {
    beforeEach(done => {
      const betaTests = [
        {
          _id: ObjectId("5f28cfae73f6d2001745886c"),
          "openDate" : new Date("2020-08-04T00:00:00.306Z"),
          "closeDate" : new Date("2020-08-14T14:59:59.000Z"),
          "title" : "[숫자야구] 게임 테스트",
          "coverImageUrl" : "https://i.imgur.com/XQGrp7g.jpg",
          "customerId" : config.testUser._id,
        },
        {
          _id: ObjectId("5f28cfae73f6d2001745886b"),
          "openDate" : new Date("2020-08-01T00:00:00.306Z"),
          "closeDate" : new Date("2020-08-15T14:59:59.000Z"),
          "title" : "게임 테스트2",
          "coverImageUrl" : "https://i.imgur.com/1234.jpg",
          "customerId" : ObjectId("5f28cfae73f6d2001745aaaa"), // otherUser
        },
        {
          _id: ObjectId("5f28cfae73f6d2001745886a"),
          "openDate" : new Date("2020-12-04T00:00:00.306Z"),
          "closeDate" : new Date("2020-12-14T14:59:59.000Z"),
          "title" : "꿀잼게임",
          "coverImageUrl" : "https://i.imgur.com/XQGrp7g11jpg",
          "customerId" : config.testUser._id,
        }
      ];

      Customers.create(config.testUser)
        .then(() => BetaTests.create(betaTests))
        .then(() => done())
        .catch(err => done(err));
    });

    it('특정 베타테스트의 정보를 반환한다', done => {
      request.get('/beta-tests/5f28cfae73f6d2001745886c')
        .set('x-access-token', config.accessToken.valid)
        .expect(200)
        .then(res => {
          // res.body._id.should.be.eql('5f28cfae73f6d2001745886c');
          res.body.title.should.be.eql('[숫자야구] 게임 테스트');
          res.body.coverImageUrl.should.be.eql('https://i.imgur.com/XQGrp7g.jpg');
          res.body.customerId.should.be.eql(config.testUser._id);
          res.body.openDate.should.be.eql('2020-08-04T00:00:00.306Z');
          res.body.closeDate.should.be.eql('2020-08-14T14:59:59.000Z');

          done();
        })
        .catch(err => done(err));
    });

    afterEach(done => {
      Customers.remove({})
        .then(() => BetaTests.remove({}))
        .then(() => done())
        .catch(err => done(err));
    });
  });

  describe('GET /beta-tests/:testId/missions', () => {
    beforeEach(done => {
      const missions = [
        {
          betaTestId: ObjectId('5f28cfae73f6d2001745886c'),
          title: "게임 설치 & 플레이",
          description: "[게임명] 게임을 설치하고 플레이하세요.",
          descriptionImageUrl: "https://i.imgur.com/XJNFDjy.png",
          guide: "• 미션에 참여하면 테스트 대상 게임 보호를 위해 무단 배포 금지에 동의한 것으로 간주됩니다.",
          packageName: "com.formakers.fomes",
          actionType: "default",
          action: "https://play.google.com/store/apps/details?id=com.formakers.fomes",
          "options": ["mandatory", "repeatable"],
          "order": 1,
          "type": "install",
        },
        {
          betaTestId: ObjectId('5f28cfae73f6d20017458861'),
          title: "I don't want it",
          description: "nonono",
          descriptionImageUrl: "https://i.imgur.com/XJNFDjy.png3",
          guide: "• 미션에 참여하면 테스트 대상 게임 보호를 위해 무단 배포 금지에 동의한 것으로 간주됩니다.3",
          packageName: "com.formakers.fomes3",
          actionType: "default",
          action: "https://play.google.com/store/apps/details?id=com.formakers.fomes",
          "order": 3,
          "type": "survey",
        },
        {
          betaTestId: ObjectId('5f28cfae73f6d2001745886c'),
          title: "mission 2",
          description: "[게임명] 게임을 설치하고 플레이하세요2",
          descriptionImageUrl: "https://i.imgur.com/XJNFDjy.png2",
          guide: "• 미션에 참여하면 테스트 대상 게임 보호를 위해 무단 배포 금지에 동의한 것으로 간주됩니다.2",
          packageName: "com.formakers.fomes2",
          actionType: "default",
          action: "https://play.google.com/store/apps/details?id=com.formakers.fomes",
          feedbackAggregationUrl: "https://play.google.com/store/apps/details?id=com.formakers.fomes2",
          "options": ["mandatory"],
          "order": 2,
          "type": "play",
        }
      ];

      Customers.create(config.testUser)
        .then(() => Missions.create(missions))
        .then(() => done())
        .catch(err => done(err));
    });

    it('특정 베타테스트의 미션 목록을 조회한다', done => {
      request.get('/beta-tests/5f28cfae73f6d2001745886c/missions')
        .set('x-access-token', config.accessToken.valid)
        .expect(200)
        .then(res => {
          res.body.length.should.be.eql(2);
          const missions = res.body.sort((a, b) => a.order > b.order ? 1 : -1);

          missions[0].betaTestId.toString().should.be.eql('5f28cfae73f6d2001745886c');
          missions[0].title.should.be.eql('게임 설치 & 플레이');
          missions[0].packageName.should.be.eql('com.formakers.fomes');
          missions[0].actionType.should.be.eql('default');
          missions[0].action.should.be.eql('https://play.google.com/store/apps/details?id=com.formakers.fomes');
          missions[0].options.should.be.eql(["mandatory", "repeatable"]);
          missions[0].order.should.be.eql(1);
          missions[0].type.should.be.eql('install');

          missions[1].betaTestId.toString().should.be.eql('5f28cfae73f6d2001745886c');
          missions[1].title.should.be.eql('mission 2');
          missions[1].packageName.should.be.eql('com.formakers.fomes2');
          missions[1].actionType.should.be.eql('default');
          missions[1].action.should.be.eql('https://play.google.com/store/apps/details?id=com.formakers.fomes');
          missions[1].options.should.be.eql(["mandatory"]);
          missions[1].order.should.be.eql(2);
          missions[1].type.should.be.eql('play');
          missions[1].feedbackAggregationUrl.should.be.eql('https://play.google.com/store/apps/details?id=com.formakers.fomes2');

          done();
        })
        .catch(err => done(err));
    });

    afterEach(done => {
      Customers.remove({})
        .then(() => Missions.remove({}))
        .then(() => done())
        .catch(err => done(err));
    })
  });

  describe('GET /beta-tests/:testId/missions/:missionId/result', () => {
    beforeEach(done => {
      const missions = [{
        _id: ObjectId('5f28cfae73f6d2001745886a'),
        betaTestId: ObjectId('5f28cfae73f6d2001745886c'),
        feedbackAggregationUrl: 'https://docs.google.com/spreadsheets/d/1shk6rNq_xQUqQcAk13pbiJ0-ycuFZUv8Lww1JDy0EAE'
      }, {
        _id: ObjectId('5f28cfae73f6d2001745886b'),
        betaTestId: ObjectId('5f28cfae73f6d2001745886c'),
      }]

      Customers.create(config.testUser)
      .then(() => Missions.create(missions))
      .then(() => done())
      .catch(err => done(err));
    });

    it('해당 미션의 결과 정보를 반환한다', done => {
      request.get('/beta-tests/5f28cfae73f6d2001745886c/missions/5f28cfae73f6d2001745886a/result')
      .set('x-access-token', config.accessToken.valid)
      .expect(200)
      .then(res => {
        res.body.headers.length.should.be.eql(13);
        res.body.headerKeys.length.should.be.eql(13);
        res.body.answers.length.should.be.eql(70);

        done();
      }).catch(err => done(err));
    })

    afterEach(done => {
      Customers.remove({})
      .then(() => Missions.remove({}))
      .then(() => done())
      .catch(err => done(err));
    })
  });
});
