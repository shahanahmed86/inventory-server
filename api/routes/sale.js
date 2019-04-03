const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const Client = require('../models/client');
const Purchase = require('../models/purchase');
const Sale = require('../models/sale');
const userAuth = require('../middleware/user-auth');

route.post('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Client.findOne({ _id: req.body.clientId })
		.exec()
		.then((client) => {
			if (client)
				return Sale.findOne({ invoice: req.body.invoice })
					.exec()
					.then((doc) => {
						if (doc)
							return res
								.status(400)
								.cookie('token', token, {
									httpOnly: true
								})
								.json('Invoice Number already exists');
						Purchase.find()
							.exec()
							.then((purchases) => {
								console.log(purchases);
							})
							.catch((err) => res.status(500).json(err));
						// const sale = new Sale();
						// for (let key in req.body) {
						// 	sale[key] = req.body[key];
						// }
						// sale
						// 	.save()
						// 	.then(() => {
						// 		return res
						// 			.status(200)
						// 			.cookie('token', token, {
						// 				httpOnly: true
						// 			})
						// 			.json('Sale saved');
						// 	})
						// 	.catch((err) => res.status(500).json(err));
					})
					.catch((err) => res.status(500).json(err));
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Please select a valid client from the list');
		})
		.catch((err) => res.status(500).json(err));
});

route.get('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Sale.find()
		.populate('products.productId clientId', 'productName clientName')
		.exec()
		.then((sales) => {
			if (sales)
				return res
					.status(200)
					.cookie('token', token, {
						httpOnly: true
					})
					.json(sales);
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Sale Book is empty');
		})
		.catch((err) => res.status(500).json(err));
});

module.exports = route;
