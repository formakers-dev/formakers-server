const jwt = require('jsonwebtoken');
const config = require('../config');
const Customers = require('../models/customers');

exports.verifyToken = (req, res, next) => {
	const token = req.headers.authorization;

	if (!token) {
		return res.status(401).json({message: "Empty Token"});
	}

	jwt.verify(token, config.jwt.secret, (err, decoded) => {
		const userId = decoded.id;

		if (err instanceof jwt.TokenExpiredError) {
			return res.status(401).json({message: "Expired Token"});
		}

		if (!userId) {
			return res.status(401).json({message: "Token is not a jwt"});
		}

		Customers.findById(userId)
			.then(user => {
				if (!user) {
					return res.status(403).json({message: "Not User"});
				}

				req.userId = user._id;
				next();
			})
			.catch(err => {
				console.error(err);
				res.sendStatus(500);
			});
	});
}