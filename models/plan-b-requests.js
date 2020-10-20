const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
	customerName: {
		type: String,
		required: [true, '회사 이름이나 담당자 이름을 입력해주세요.'],
		trim: true
	},
	customerEmail: {
		type: String,
		required: [true, '연락받으실 이메일 주소를 입력해주세요.'],
		trim: true,
		validate: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, '유효한 이메일 주소를 입력해주세요.']
	},
	interests: [String],
	selectedUsers: Array,
	createdAt: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('plan-b-requests', requestSchema);
