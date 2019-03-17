const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const Product = require('../models/product');
const Vendor = require('../models/vendor');
const Purchase = require('../models/purchase');
const userAuth = require('../middleware/user-auth');

route.post(
    '/',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        Product.findOne({ _id: req.body.productId }).exec().then(productMatch => {
            if (productMatch) return Vendor.findOne({ _id: req.body.vendorId }).exec().then(vendorMatch => {
                if (vendorMatch) return Purchase.findOne({ invoice: req.body.invoice }).exec().then(doc => {
                    if (doc) return res.status(226).cookie('token', token, {
                        httpOnly: true
                    }).json('Invoice Number already exists');
                    const purchase = new Purchase();
                    for (let key in req.body) {
                        purchase[key] = req.body[key];
                    }
                    Product.updateOne({ _id: req.body.productId }, {
                        $set: { quantity: productMatch.quantity + req.body.quantity }
                    }).then(() => {
                        purchase.save().then(() => {
                            return res.status(200).cookie('token', token, {
                                httpOnly: true
                            }).json('Purchase saved');
                        }).catch(err => res.status(500).json(err));
                    })
                }).catch(err => res.status(500).json(err));
                return res.status(404).cookie('token', token, {
                    httpOnly: true
                }).json('Make sure you have typed a valid vendor Id');
            }).catch(err => res.status(500).json(err));
            return res.status(404).cookie('token', token, {
                httpOnly: true
            }).json('Make sure you have typed a valid product Id');
        }).catch(err => res.status(500).json(err));
    });

route.get(
    '/',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        Purchase.find()
            .populate('productId vendorId', 'productName vendorName')
            .exec().then(purchases => {
                if (purchases) return res.status(200).cookie('token', token, {
                    httpOnly: true
                }).json(purchases);
                return res.status(404).cookie('token', token, {
                    httpOnly: true
                }).json('Purchase book is empty');
            }).catch(err => res.status(500).json(err));
    });

route.put(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        const updatedPurchase = {};
        for (let key in req.body) {
            updatedPurchase[key] = req.body[key];
        }
        Purchase.updateOne({ _id }, { $set: updatedPurchase }).then(() => {
            res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json('Purchase Updated Successfully');
        }).catch(err => res.status(500).json(err));
    });

route.delete(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        Purchase.findOne({ _id: req.params.id }).exec().then(invoice => {
            if (invoice) return Product.findOne({ _id: invoice.productId }).exec().then(doc => {
                Product.updateOne({ _id: doc._id }, {
                    $set: {
                        quantity: doc.quantity + req.body.quantity
                    }
                }).then(() => {
                    Purchase.deleteOne({ _id }).then(() => {
                        return res.status(200).cookie('token', token, {
                            httpOnly: true,
                        }).json('Purchase Deleted');
                    }).catch(err => res.status(500).json(err));
                }).catch(err => res.status(500).json(err));
            }).catch(err => res.status(500).json(err));
        }).catch(err => res.status(500).json(err));
    });

module.exports = route;