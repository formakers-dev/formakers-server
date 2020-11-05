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

	let text = `🎁 *Persona에 새로운 요청이 들어왔습니다!*
- 요청일자: ${request.createdAt.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
- 보낸이: ${request.customerName} / ${request.customerEmail}
- 관심사: ${request.interests.join(", ")}

🔍 *선택한 검색필터*
- 성별: ${request.selectedOptions[0].gender.length ? request.selectedOptions[0].gender.join(", ") : "-"}
- 연령대: ${request.selectedOptions[0].ageGroup.length ? request.selectedOptions[0].ageGroup.join(", ") : "-"}
- 게임 플레이 방식: ${request.selectedOptions[0].playStyle.length ? request.selectedOptions[0].playStyle.join(", ") : "-"}
- 과금 여부: ${request.selectedOptions[0].payStyle.length ? request.selectedOptions[0].payStyle.join(", ") : "-"}

👥 *선택한 유저* (총 ${request.selectedUsers.length}명)`;

	request.selectedUsers.forEach(user => {
		const userData = `
- 유저 ID: ${user.userId} / 닉네임: ${user.nickName} / ${user.gender} / ${user.email} / ${user.birthday}년생 / 직업코드: ${user.job} / 월 과금규모: ${user.monthlyPayment ? user.monthlyPayment : "-"}만원`;
		text = text + userData;
	});

	web.chat.postMessage({
		text,
		channel: config.slackChannel,
		as_user: true
	});

	res.status(201).json(request);
});
