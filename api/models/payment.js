const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
	date: {
		type: Date,
		required: true
	},
	refNo: {
		type: String,
		required: true
	},
	vendorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Vendor',
		required: true
	},
	details: [
		{
			purchaseId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Purchase',
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

module.exports = mongoose.model('Payment', paymentSchema);
