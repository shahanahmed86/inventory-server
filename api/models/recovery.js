const mongoose = require('mongoose');

const recoverySchema = mongoose.Schema({
	date: {
		type: Date,
		required: true
	},
	refNo: {
		type: String,
		required: true
	},
	clientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Client',
		required: true
	},
	details: [
		{
			saleId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Sale',
				required: true
			},
			invoice: {
				type: String,
				required: true
			},
			pay: {
				type: Number,
				required: true
			},
			description: {
				type: String,
				required: true
			}
		}
	]
});

module.exports = mongoose.model('Recovery', recoverySchema);
