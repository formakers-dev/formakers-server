module.exports = ({ gender, ageGroup, playStyle, payStyle }) => {
	const formattedReqBody = {};

	// gender 필드 -> "무관"이 아닌 경우 쿼리 설정
	if (gender.length && !gender.includes("all")) {
		formattedReqBody.gender = gender;
	}

	// ageGroup 필드 -> birthday range 설정
	if (ageGroup.length && !ageGroup.includes("all")) {
		const ageQuery = [];
		const currentYear = new Date().getFullYear();
		const setBirthdayRange = ([gte, lte]) => {
			ageQuery.push({ "birthday": { "$gte": currentYear - gte, "$lte": currentYear - lte } });
		}

		const ageRange = {
			"under10": [9, 0],
			"10s": [19, 10],
			"20s": [29, 20],
			"30s": [39, 30],
			"40s": [49, 40],
			"50s": [59, 50],
			"over60": [200, 60]
		}

		ageGroup.forEach(group => {
			setBirthdayRange(ageRange[group]);
		});

		formattedReqBody["$or"] = ageQuery;
	}

	// playStyle 필드 -> platforms, genres로 나누기
	if (playStyle.length && !playStyle.includes("all")) {
		const platformFields = ["pc", "mobile", "console"];
		const platforms = playStyle.filter(style => platformFields.includes(style));

		// platforms 옵션이 포함된 경우
		if (platforms.length) {
			formattedReqBody.favoritePlatforms = { "$all": platforms };
			if (playStyle.length > platforms.length) {
				const genres = playStyle.filter(style => !platformFields.includes(style));
				formattedReqBody.favoriteGenres = { "$all": genres };
			}
		} else {
			// platforms 옵션은 없고 && genres만 있는 경우
			formattedReqBody.favoriteGenres = { "$all": playStyle };
		}
	}

	// payStyle 필드 -> 과금유저, 무과금유저로 나누기
	if (payStyle.length === 1) {
		if (payStyle[0] === "free") {
			formattedReqBody.monthlyPayment = 0;
		} else if (payStyle[0] === "pay") {
			formattedReqBody.monthlyPayment = { "$gt": 0 };
		}
	}

	return formattedReqBody;
}
