const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const pusher = require('../../config/pusherconfig');
const Vendor = require('../models/vendor');
const Payment = require('../models/payment');
const userAuth = require('../middleware/user-auth');

route.post('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Vendor.findOne({ _id: req.body.vendorId })
		.exec()
		.then((vendor) => {
			if (vendor)
				return Payment.findOne({ refNo: req.body.refNo })
					.exec()
					.then((doc) => {
						if (doc)
							return res
								.status(400)
								.cookie('token', token, {
									httpOnly: true
								})
								.json('Reference Number already exists');
						const payment = new Payment();
						for (let key in req.body) {
							payment[key] = req.body[key];
						}
						payment
							.save()
							.then(() => {
								pusher.trigger('inventory', 'payments', { message: 'payments' });
								return res
									.status(200)
									.cookie('token', token, {
										httpOnly: true
									})
									.json('Payment saved');
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
	Payment.find()
		.populate('vendorId', 'vendorName ')
		.exec()
		.then((payments) => {
			if (payments)
				return res
					.status(200)
					.cookie('token', token, {
						httpOnly: true
					})
					.json(payments);
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Payment book is empty');
		})
		.catch((err) => res.status(500).json(err));
});

route.put('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Vendor.findOne({ _id: req.body.vendorId })
		.exec()
		.then((vendor) => {
			if (vendor) {
				const updatedPayment = {};
				for (let key in req.body) {
					updatedPayment[key] = req.body[key];
				}
				return Payment.updateOne({ _id: req.params.id }, { $set: updatedPayment })
					.then(() => {
						pusher.trigger('inventory', 'payments', { message: 'payments' });
						return res
							.status(201)
							.cookie('token', token, {
								httpOnly: true
							})
							.json('Payment Updated');
					})
					.catch((err) => res.status(500).json(err));
			} else {
				return res
					.status(404)
					.cookie('token', token, {
						httpOnly: true
					})
					.json('Please select a valid vendor from the list');
			}
		})
		.catch((err) => res.status(500).json(err));
});

route.delete('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	const _id = req.params.id;
	Payment.deleteOne({ _id })
		.then(() => {
			pusher.trigger('inventory', 'payment', { message: 'payment' });
			return res
				.status(200)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Payment Deleted');
		})
		.catch((err) => res.status(500).json(err));
});

module.exports = route;
