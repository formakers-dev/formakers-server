const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
	options: Array,
	order: Number,
	type: String,
	title: String,
	description: String,
	descriptionImageUrl: String,
	guide: String,
	packageName: String,
	actionType: String,
	action: String,
	betaTestId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Mission', missionSchema);
