const express = require('express');
const route = express.Router();

const Product = require('../models/product');
const userAuth = require('../middleware/user-auth');

route.post(
    '/save',
    userAuth,
    (req, res) => {
        const product = new Product();
        for (let key in req.body) {
            product[key] = req.body[key];
        }
        product.save()
            .then(doc => {
                res.status(201).json({ doc });
            })
            .catch(err => res.status(500).json(err.errors));
    });

route.delete(
    '/delete/:id',
    userAuth,
    (req, res) => {
        const _id = req.params.id;
        Product.deleteOne({ _id }).then(doc => {
            res.status(200).json({ doc });
        }).catch(err => res.status(500).json(err.errors));
    });

route.put(
    '/update/:id',
    userAuth,
    (req, res) => {
        const _id = req.params.id;
        const updatedProduct = {};
        for (let key in req.body) {
            updatedProduct[key] = req.body[key];
        }
        Product.updateOne({ _id }, { $set: updatedProduct }).then(doc => {
            res.status(200).json({ doc });
        }).catch(err => res.status(500).json(err.errors));
    });

route.get(
    '/',
    userAuth,
    (req, res) => {
        Product.find().exec().then(docs => {
            res.status(200).json({
                products: docs.map(val => val)
            });
        }).catch(err => res.status(500).json(err.errors))
    }
)

module.exports = route;