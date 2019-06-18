const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const pusher = require('../../config/pusherconfig');
const Product = require('../models/product');
const userAuth = require('../middleware/user-auth');

route.post('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	const product = new Product();
	for (let key in req.body) {
		product[key] = req.body[key];
	}
	product
		.save()
		.then(() => {
			pusher.trigger('inventory', 'products', { message: 'products' });
			return res
				.status(201)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Product Saved');
		})
		.catch((err) => res.status(500).json(err));
});

route.get('/', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	Product.find()
		.exec()
		.then((docs) => {
			res
				.status(200)
				.cookie('token', token, {
					httpOnly: true
				})
				.json({
					products: docs.map((val) => val)
				});
		})
		.catch((err) => res.status(500).json(err));
});

route.put('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	const _id = req.params.id;
	const updatedProduct = {};
	for (let key in req.body) {
		updatedProduct[key] = req.body[key];
	}
	Product.updateOne({ _id }, { $set: updatedProduct })
		.then(() => {
			pusher.trigger('inventory', 'products', { message: 'products' });
			return res
				.status(200)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Product Updated Successfully');
		})
		.catch((err) => res.status(500).json(err));
});

route.delete('/:id', userAuth, (req, res) => {
	const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
	const _id = req.params.id;
	Product.deleteOne({ _id })
		.then(() => {
			pusher.trigger('inventory', 'products', { message: 'products' });
			return res
				.status(200)
				.cookie('token', token, {
					httpOnly: true
				})
				.json('Product Deleted');
		})
		.catch((err) => res.status(500).json(err));
});

module.exports = route;
