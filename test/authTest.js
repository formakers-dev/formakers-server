const chai = require('chai');
const should = chai.should();
const bcrypt = require('bcryptjs');
const server = require('../server');
const request = require('supertest').agent(server);
const config = require('../config');
const Customers = require('../models/customers');
const setupTestMiddleware = require('./setupTestMiddleware');
const ObjectId = require('mongoose').Types.ObjectId;

describe('Auth', () => {
	describe('POST /auth/sign-up', () => {
		it('유저가 전달한 유저정보로 회원가입이 정상적으로 이루어진다', done => {
			const reqBody = {
				email: 'fomes@formakers.net',
				password: 'test11',
				companyName: 'ForMakers'
			};

			request.post('/auth/sign-up')
				.send(reqBody)
				.expect(201)
				.then(res => {
					res.body.email.should.be.eql('fomes@formakers.net');
					res.body.companyName.should.be.eql('ForMakers');

					return Customers.findOne({email: reqBody.email});
				})
				.then(user => {
					if (user) {
						user.email.should.be.eql('fomes@formakers.net');
						user.companyName.should.be.eql('ForMakers');
						// user.signUpDate.should.be.eql(new Date('2020-12-02'));
						const pw = bcrypt.compareSync(reqBody.password, user.password);
						pw.should.be.true;

						done();
					} else {
						return Promise.reject("User is not Exist!");
					}
				})
				.catch(err => done(err));

		});

		it('유저가 전달한 이메일 주소 형식이 올바르지 않으면 412을 리턴한다', done => {
			const reqBody = {
				email: 'fomes@formakers',
				password: 'test11',
				companyName: 'ForMakers'
			};

			request.post('/auth/sign-up')
				.send(reqBody)
				.expect(412)
				.then(res => {
					res.body.error.should.be.eql('올바른 이메일 주소를 입력해주세요.');
					done();
				})
				.catch(err => done(err));
		});

		describe('유저가 전달한 이메일 주소로 이미 가입된 계정이 있는 경우', () => {
			const reqBody = {
				email: 'fomes@formakers.net',
				password: 'test11',
				companyName: 'ForMakers'
			};

			beforeEach(done => {
				Customers.create(reqBody)
					.then(() => done())
					.catch(err => done(err));
			});

			it('409을 리턴한다', done => {
				request.post('/auth/sign-up')
					.send(reqBody)
					.expect(409)
					.then(res => {
						res.body.error.should.be.eql('이미 가입된 계정입니다.');
						done();
					})
					.catch(err => done(err));
			});
		});

		it('유저가 전달한 비밀번호가 6자 미만일 경우 412를 리턴한다', done => {
			const reqBody = {
				email: 'fomes@formakers.net',
				password: 'test',
				companyName: 'ForMakers'
			};

			request.post('/auth/sign-up')
				.send(reqBody)
				.expect(412)
				.then(res => {
					res.body.error.should.be.eql('비밀번호를 6자 이상으로 설정해주세요.');
					done();
				})
				.catch(err => done(err));
		});

		afterEach(done => {
			Customers.remove({})
				.then(() => done())
				.catch(err => done(err));
		});
	});

	describe('POST /auth/login', () => {
		beforeEach(done => {
			const user = {
				email: 'fomes@formakers.net',
				password: 'test11',
				companyName: 'ForMakers'
			};

			Customers.create(user)
				.then(() => done())
				.catch(err => done(err));
		});

		it('유저가 올바른 이메일과 비밀번호를 전달하면 로그인이 이루어진다', done => {
			const reqBody = {
				email: 'fomes@formakers.net',
				password: 'test11'
			};

			request.post('/auth/login')
				.send(reqBody)
				.expect(200)
				.then(res => {
					should.exist(res.body.token);
					done();
				})
				.catch(err => done(err));
		});

		it('유저가 필수 필드값을 전달하지 않으면 400을 리턴한다', done => {
			const reqBody = {
				email: 'fomes@formakers.net'
			};

			request.post('/auth/login')
				.send(reqBody)
				.expect(400)
				.then(res => {
					res.body.error.should.be.eql('이메일과 비밀번호를 입력해주세요.');
					done();
				})
				.catch(err => done(err));
		});

		it('존재하지 않는 유저일 경우 204를 리턴한다', done => {
			const reqBody = {
				email: 'ghost@formakers.net',
				password: 'test11'
			};

			request.post('/auth/login')
				.send(reqBody)
				.expect(204)
				.then(() => done())
				.catch(err => done(err));
		});

		it('비밀번호가 일치하지 않을 경우 401을 리턴한다', done => {
			const reqBody = {
				email: 'fomes@formakers.net',
				password: 'test12'
			};

			request.post('/auth/login')
				.send(reqBody)
				.expect(401)
				.then(res => {
					res.body.error.should.be.eql('비밀번호가 일치하지 않습니다.');
					done();
				})
				.catch(err => done(err));
		});

		afterEach(done => {
			Customers.remove({})
				.then(() => done())
				.catch(err => done(err));
		});
	});

	describe('POST /auth/logout', () => {
		beforeEach(done => {
			Customers.create({
				_id: ObjectId(config.testUser._id),
				email: config.testUser.email,
				password: config.testUser.password,
				companyName: config.testUser.companyName,
			})
				.then(() => done())
				.catch(err => done(err));
		});

		it('유저가 로그아웃을 요청하면 인증 관련 필드값들이 삭제되고 204를 리턴한다', done => {
			request.post('/auth/logout')
				.set('x-access-token', config.accessToken.valid)
				.expect(204)
				.then(res => {
					res.headers['set-cookie'][0].should.be.include("access_token=;");
					should.not.exist(res.headers['x-access-token']);
					done();
				})
				.catch(err => done(err));
		});

		afterEach(done => {
			Customers.remove({})
				.then(() => done())
				.catch(err => done(err));
		})
	});

	describe('Auth Middleware', () => {
		it('비정상적인 토큰을 이용하여 로그아웃을 요청하면 401을 리턴한다', done => {
			request.post('/auth/logout')
				.set('x-access-token', config.accessToken.invalid)
				.expect(401)
				.then(res => {
					res.body.message.should.be.eql('Token is not a jwt');
					done();
				})
				.catch(err => done(err));
		});

		it('만료 토큰을 이용하여 로그아웃을 요청하면 401을 리턴한다', done => {
			request.post('/auth/logout')
				.set('x-access-token', config.accessToken.expired)
				.expect(401)
				.then(res => {
					res.body.message.should.be.eql('Expired Token');
					done();
				})
				.catch(err => done(err));
		});

		it('비회원이 로그아웃을 요청하면 403을 리턴한다', done => {
			request.post('/auth/logout')
				.set('x-access-token', config.accessToken.valid)
				.expect(403)
				.then(res => {
					res.body.message.should.be.eql('Not User');
					done();
				})
				.catch(err => done(err));
		});
	});
});
