const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
	date: {
		type: Date,
		required: true
	},
	invoice: {
		type: String,
		required: true
	},
	clientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Client',
		required: true
	},
	products: [
		{
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			quantity: {
				type: Number,
				required: true
			},
			sellingPrice: {
				type: Number,
				required: true
			},
			value: {
				type: Number,
				required: true
			}
		}
	]
});

module.exports = mongoose.model('Sale', saleSchema);
