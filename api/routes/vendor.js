const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const pusher = require('../../config/pusherconfig');
const Vendor = require('../models/vendor');
const userAuth = require('../middleware/user-auth');

route.post(
    '/',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const vendor = new Vendor();
        for (let key in req.body) {
            vendor[key] = req.body[key];
        }
        vendor.save()
            .then(() => {
                pusher.trigger('inventory', 'vendors', { "message": "Vendors" });
                return res.status(201).cookie('token', token, {
                    httpOnly: true,
                }).json('Vendor Saved');
            })
            .catch(err => res.status(500).json(err));
    });

route.get(
    '/',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        Vendor.find().exec().then(docs => {
            res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json({
                vendors: docs.map(val => val)
            });
        }).catch(err => res.status(500).json(err))
    });

route.put(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        const updatedVendor = {};
        for (let key in req.body) {
            updatedVendor[key] = req.body[key];
        }
        Vendor.updateOne({ _id }, { $set: updatedVendor }).then(() => {
            pusher.trigger('inventory', 'vendors', { "message": "Vendors" });
            return res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json('Vendor Updated Successfully');
        }).catch(err => res.status(500).json(err));
    });

route.delete(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        Vendor.deleteOne({ _id }).then(() => {
            pusher.trigger('inventory', 'vendors', { "message": "Vendors" });
            return res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json('Vendor Deleted');
        }).catch(err => res.status(500).json(err));
    });

module.exports = route;