const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const pusher = require('../../config/pusherconfig');
const Client = require('../models/client');
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
						const sale = new Sale();
						for (let key in req.body) {
							sale[key] = req.body[key];
						}
						sale
							.save()
							.then(() => {
								pusher.trigger('inventory', 'sales', { "message": "Sales" });
								return res
									.status(200)
									.cookie('token', token, {
										httpOnly: true
									})
									.json('Sale saved');
							})
							.catch((err) => res.status(500).json(err));
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
			if (sales) return res.status(200).cookie('token', token, { httpOnly: true }).json(sales);
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Sale Book is empty');
		})
		.catch((err) => res.status(500).json(err));
});

route.put('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Client.findOne({ _id: req.body.clientId })
		.exec()
		.then((client) => {
			if (client) {
				const updatedSale = {};
				for (let key in req.body) {
					updatedSale[key] = req.body[key];
				}
				return Sale.updateOne({ _id: req.params.id }, { $set: updatedSale })
					.then(() => {
						pusher.trigger('inventory', 'sales', { "message": "Sales" });
						return res
							.status(201)
							.cookie('token', token, {
								httpOnly: true
							})
							.json('Sales Updated');
					})
					.catch((err) => res.status(500).json(err));
			} else {
				return res
					.status(404)
					.cookie('token', token, {
						httpOnly: true
					})
					.json('Please select a valid client from the list');
			}
		})
		.catch((err) => res.status(500).json(err));
});

route.delete('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	const _id = req.params.id;
	Sale.deleteOne({ _id })
		.then(() => {
			pusher.trigger('inventory', 'sales', { "message": "Sales" });
			return res
				.status(200)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Sale Deleted');
		})
		.catch((err) => res.status(500).json(err));
});

module.exports = route;
