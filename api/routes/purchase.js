const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const pusher = require('../../config/pusherconfig');
const Vendor = require('../models/vendor');
const Purchase = require('../models/purchase');
const userAuth = require('../middleware/user-auth');

route.post('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Vendor.findOne({ _id: req.body.vendorId })
		.exec()
		.then((vendor) => {
			if (vendor)
				return Purchase.findOne({ invoice: req.body.invoice })
					.exec()
					.then((doc) => {
						if (doc)
							return res
								.status(400)
								.cookie('token', token, {
									httpOnly: true
								})
								.json('Invoice Number already exists');
						const purchase = new Purchase();
						for (let key in req.body) {
							purchase[key] = req.body[key];
						}
						purchase
							.save()
							.then(() => {
								pusher.trigger('inventory', 'purchases', { "message": "Purchases" });
								return res
									.status(200)
									.cookie('token', token, {
										httpOnly: true
									})
									.json('Purchase saved');
							})
							.catch((err) => res.status(500).json(err));
					})
					.catch((err) => res.status(500).json(err));
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Please select a valid vendor from the list');
		})
		.catch((err) => res.status(500).json(err));
});

route.get('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Purchase.find()
		.populate('products.productId vendorId', 'productName vendorName')
		.exec()
		.then((purchases) => {
			if (purchases)
				return res
					.status(200)
					.cookie('token', token, {
						httpOnly: true
					})
					.json(purchases);
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Purchase book is empty');
		})
		.catch((err) => res.status(500).json(err));
});

module.exports = route;