const chai = require('chai');
const should = chai.should();
const bcrypt = require('bcryptjs');
const server = require('../server');
const request = require('supertest').agent(server);
const config = require('../config');
const Customers = require('../models/customers');
const setupTestMiddleware = require('./setupTestMiddleware');

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
});
