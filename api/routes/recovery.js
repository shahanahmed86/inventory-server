const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const pusher = require('../../config/pusherconfig');
const Client = require('../models/client');
const Recovery = require('../models/recovery');
const userAuth = require('../middleware/user-auth');

route.post('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Client.findOne({ _id: req.body.clientId })
		.exec()
		.then((client) => {
			if (client)
				return Recovery.findOne({ refNo: req.body.refNo })
					.exec()
					.then((doc) => {
						if (doc)
							return res
								.status(400)
								.cookie('token', token, {
									httpOnly: true
								})
								.json('Reference Number already exists');
						const recovery = new Recovery();
						for (let key in req.body) {
							recovery[key] = req.body[key];
						}
						recovery
							.save()
							.then(() => {
								pusher.trigger('inventory', 'recoveries', { message: 'recoveries' });
								return res
									.status(200)
									.cookie('token', token, {
										httpOnly: true
									})
									.json('recovery saved');
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
	Recovery.find()
		.populate('clientId', 'clientName ')
		.exec()
		.then((recoveries) => {
			if (recoveries)
				return res
					.status(200)
					.cookie('token', token, {
						httpOnly: true
					})
					.json(recoveries);
			return res
				.status(404)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Recovery book is empty');
		})
		.catch((err) => res.status(500).json(err));
});

route.put('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Client.findOne({ _id: req.body.clientId })
		.exec()
		.then((client) => {
			if (client) {
				const updatedRecovery = {};
				for (let key in req.body) {
					updatedRecovery[key] = req.body[key];
				}
				return Recovery.updateOne({ _id: req.params.id }, { $set: updatedRecovery })
					.then(() => {
						pusher.trigger('inventory', 'recoveries', { message: 'recoveries' });
						return res
							.status(201)
							.cookie('token', token, {
								httpOnly: true
							})
							.json('Recovery Updated');
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
	Recovery.deleteOne({ _id })
		.then(() => {
			pusher.trigger('inventory', 'recoveries', { message: 'recoveries' });
			return res
				.status(200)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Recovery Deleted');
		})
		.catch((err) => res.status(500).json(err));
});

module.exports = route;
