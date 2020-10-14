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
		const setBirthdayRange = (gte, lte) => {
			ageQuery.push({ "birthday": { "$gte": currentYear - gte, "$lte": currentYear - lte } });
		}

		ageGroup.forEach(group => {
			switch (group) {
				case "under10":
					setBirthdayRange(9, 0);
					break;
				case "10s":
					setBirthdayRange(19, 10);
					break;
				case "20s":
					setBirthdayRange(29, 20);
					break;
				case "30s":
					setBirthdayRange(39, 30);
					break;
				case "40s":
					setBirthdayRange(49, 40);
					break;
				case "50s":
					setBirthdayRange(59, 50);
					break;
				case "over60":
					setBirthdayRange(69, 150);
					break;
			}
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
