const chai = require('chai');
const should = chai.should();
const bcrypt = require('bcryptjs');
const server = require('../server');
const request = require('supertest').agent(server);
const config = require('../config');
const Customers = require('../models/customers');
const BetaTests = require('../models/betaTests');
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
          res.body.sort((a, b) => a._id - b._id);

          // res.body[0]._id.should.be.eql("5f28cfae73f6d2001745886a");
          res.body[0].title.should.be.eql("꿀잼게임");
          res.body[0].openDate.should.be.eql(new Date("2020-12-04T00:00:00.306Z"));
          res.body[0].closeDate.should.be.eql( new Date("2020-12-14T14:59:59.000Z"));
          res.body[0].coverImageUrl.should.be.eql("https://i.imgur.com/XQGrp7g11jpg");
          res.body[0].customerId.should.be.eql(config.testUser._id);

          res.body[1].title.should.be.eql("[숫자야구] 게임 테스트");
          res.body[1].openDate.should.be.eql(new Date("2020-08-04T00:00:00.306Z"));
          res.body[1].closeDate.should.be.eql( new Date("2020-08-14T14:59:59.000Z"));
          res.body[1].coverImageUrl.should.be.eql( "https://i.imgur.com/XQGrp7g.jpg");
          res.body[1].customerId.should.be.eql(config.testUser._id);

          done();
        })
        .catch(err => done(err));

    });

    afterEach(done => {
      Customers.remove({})
        .then(() => BetaTests.remove({}))
        .then(() => done())
        .catch(err => done(err));
    })
  });
});