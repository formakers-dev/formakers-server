const jwt = require('jsonwebtoken');
const Customer = require('../models/customers');
const config = require('../config');

const generateToken = (customerId) => {
	return jwt.sign(
		{ id: customerId },
		config.jwt.secret,
		{ expiresIn: config.jwt.expiresIn });
}

// @desc        Customer 회원가입
// @route       POST /auth/sign-up
// @access      Public
exports.signUp = async (req, res, next) => {
	const { email, password, companyName } = req.body;

	if (!(email && password && companyName)) {
		return res.status(400).json({ error: '이메일, 비밀번호, 회사이름을 모두 입력해주세요.' });
	}

	try {
		const customer = await Customer.create({
			email,
			password,
			companyName
		});

		delete customer.password;

		res.status(201).json(customer);
	} catch (err) {
		console.error(err);

		if (err.name === 'ValidationError') {
			if (err.errors.password && err.errors.password.kind === 'minlength') {
				return res.status(412).json({ error: '비밀번호를 6자 이상으로 설정해주세요.' });
			} else {
				return res.status(412).json({error: '올바른 이메일 주소를 입력해주세요.'});
			}
		} else if (err.code === 11000) {
			return res.status(409).json({ error: '이미 가입된 계정입니다.' });
		}

		res.status(500).json({ error: err.message });
	}
}

// @desc        Customer 로그인
// @route       POST /auth/login
// @access      Public
exports.login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		// 400 : empty argument
		return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
	}

	try {
		const customer = await Customer.findOne({email});

		if (!customer) {
			return res.sendStatus(204);
		} else if (!await customer.comparePassword(password)) {
			return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
		}

		const token = generateToken(customer._id.toString());

		console.log(res.headers);
		res.status(200).json({token : token});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
}

// @desc        Customer 로그아웃
// @route       POST /auth/logout
// @access      Private
exports.logout = (req, res, next) => {
	res.clearCookie('access_token');
	res.removeHeader('x-access-token');
	return res.sendStatus(204);
}
