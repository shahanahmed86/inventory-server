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
        Product.findOne({ _id: req.body.productId }).exec().then(product => {
            if (product) return Vendor.findOne({ _id: req.body.vendorId }).exec().then(vendor => {
                if (vendor) return Purchase.findOne({ invoice: req.body.invoice }).exec().then(doc => {
                    if (doc) return res.status(226).cookie('token', token, {
                        httpOnly: true
                    }).json('Invoice Number already exists');
                    const purchase = new Purchase();
                    for (let key in req.body) {
                        purchase[key] = req.body[key];
                    }
                    Product.updateOne({ _id: req.body.productId }, {
                        $set: { quantity: product.quantity + req.body.quantity }
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
                }).json('Please select a valid vendor from the list');
            }).catch(err => res.status(500).json(err));
            return res.status(404).cookie('token', token, {
                httpOnly: true
            }).json('Please select a valid vendor from the list');
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
        Purchase.findOne({ _id }).exec().then(invoice => {
            if (invoice) return Product.findOne({ _id: invoice.productId }).exec().then(oldProduct => {
                if (oldProduct) { 
                    Product.findOne({ _id: req.body.productId }).exec().then(newProduct => {
                        if (newProduct) {
                            const oldSumQty = oldProduct.quantity - invoice.quantity;
                            if (oldSumQty >= 0) {
                                Product.updateOne({ _id: oldProduct._id }, {
                                    $set: { quantity: oldSumQty }
                                }).exec().then(() => {
                                    Product.updateOne({ _id: newProduct._id }, {
                                        $set: { quantity: newProduct.quantity + req.body.quantity }
                                    }).then(() => {
                                        const updatedProduct = {};
                                        for (let key in req.body) {
                                            updatedProduct[key] = req.body[key];
                                        }
                                        Purchase.updateOne({ _id }, { $set: updatedProduct }).exec().then(() => {
                                            return res.status(200).cookie('token', token, {
                                                httpOnly: true,
                                            }).json('Invoice edited');
                                        }).catch(err => res.status(500).json(err));
                                    }).catch(err => res.status(500).json(err));
                                }).catch(err => res.status(500).json(err));
                            } else {
                                return res.status(400).cookie('token', token, {
                                    httpOnly: true,
                                }).json(`${oldProduct.productName} will get negative by ${oldSumQty}, if edited.`);
                            }
                        } else {
                            return res.status(404).cookie('token', token, {
                                httpOnly: true,
                            }).json('Product not found');
                        }
                    })
                } else {
                    return res.status(404).cookie('token', token, {
                        httpOnly: true,
                    }).json('Product not found');
                }
            }).catch(err => res.status(500).json(err));
            return res.status(404).cookie('token', token, {
                httpOnly: true,
            }).json('Invoice not found');
        }).catch(err => res.status(500).json(err));
    });

route.delete(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        Purchase.findOne({ _id }).exec().then(invoice => {
            if (invoice) return Product.findOne({ _id: invoice.productId }).exec().then(product => {
                if (product) {
                    const getSum = product.quantity - invoice.quantity;
                    if (getSum >= 0) return Product.updateOne({ _id: invoice.productId }, {
                        $set: { quantity: getSum }
                    }).then(() => {
                        Purchase.deleteOne({ _id }).exec().then(() => {
                            return res.status(200).cookie('token', token, {
                                httpOnly: true,
                            }).json('Invoice deleted');
                        }).catch(err => res.status(500).json(err));
                    }).catch(err => res.status(500).json(err));
                    return res.status(400).cookie('token', token, {
                        httpOnly: true,
                    }).json(`${product.productName} will get negative by ${getSum}, if deleted.`);
                } else {
                    return res.status(404).cookie('token', token, {
                        httpOnly: true,
                    }).json('Product not found');
                }
            }).catch(err => res.status(500).json(err));
            return res.status(404).cookie('token', token, {
                httpOnly: true,
            }).json('Invoice not found');
        }).catch(err => res.status(500).json(err));
    });

module.exports = route;