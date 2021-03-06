const asyncHandler = require('../middlewares/asyncHandler');
const Request = require('../models/plan-b-requests');

const { WebClient } = require('@slack/web-api');
const config = require('../config');

// @desc       Create request for user matching
// @route      POST /requests
// @access     Public
exports.createRequest = asyncHandler(async(req, res, next) => {
	const request = await Request.create(req.body);

	const botApiToken = config.slackApiToken;
	const web = new WebClient(botApiToken);

	let text = `π *Personaμ μλ‘μ΄ μμ²­μ΄ λ€μ΄μμ΅λλ€!*
- μμ²­μΌμ: ${request.createdAt.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
- λ³΄λΈμ΄: ${request.customerName} / ${request.customerEmail}
- κ΄μ¬μ¬: ${request.interests.join(", ")}

π *μ νν κ²μνν°*
- μ±λ³: ${request.selectedOptions[0].gender.length ? request.selectedOptions[0].gender.join(", ") : "-"}
- μ°λ Ήλ: ${request.selectedOptions[0].ageGroup.length ? request.selectedOptions[0].ageGroup.join(", ") : "-"}
- κ²μ νλ μ΄ λ°©μ: ${request.selectedOptions[0].playStyle.length ? request.selectedOptions[0].playStyle.join(", ") : "-"}
- κ³ΌκΈ μ¬λΆ: ${request.selectedOptions[0].payStyle.length ? request.selectedOptions[0].payStyle.join(", ") : "-"}

π₯ *μ νν μ μ * (μ΄ ${request.selectedUsers.length}λͺ)`;

	request.selectedUsers.forEach(user => {
		const userData = `
- μ μ  ID: ${user.userId} / λλ€μ: ${user.nickName} / ${user.gender} / ${user.email} / ${user.birthday}λμ / μ§μμ½λ: ${user.job} / μ κ³ΌκΈκ·λͺ¨: ${user.monthlyPayment ? user.monthlyPayment : "-"}λ§μ`;
		text = text + userData;
	});

	web.chat.postMessage({
		text,
		channel: config.slackChannel,
		as_user: true
	});

	res.status(201).json(request);
});
