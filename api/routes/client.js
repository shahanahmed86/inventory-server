const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();

const Client = require('../models/client');
const userAuth = require('../middleware/user-auth');

route.post(
    '/',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const client = new Client();
        for (let key in req.body) {
            client[key] = req.body[key];
        }
        client.save()
            .then(() => {
                res.status(201).cookie('token', token, {
                    httpOnly: true,
                }).json('Client Saved');
            })
            .catch(err => res.status(500).json(err));
    });

route.get(
    '/',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        Client.find().exec().then(docs => {
            res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json({
                clients: docs.map(val => val)
            });
        }).catch(err => res.status(500).json(err))
    });

route.put(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        const updatedClient = {};
        for (let key in req.body) {
            updatedClient[key] = req.body[key];
        }
        Client.updateOne({ _id }, { $set: updatedClient }).then(() => {
            res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json('Client Updated Successfully');
        }).catch(err => res.status(500).json(err));
    });

route.delete(
    '/:id',
    userAuth,
    (req, res) => {
        const token = jwt.sign({ _id: req.userData._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        const _id = req.params.id;
        Client.deleteOne({ _id }).then(() => {
            res.status(200).cookie('token', token, {
                httpOnly: true,
            }).json('Client Deleted');
        }).catch(err => res.status(500).json(err));
    });

module.exports = route;