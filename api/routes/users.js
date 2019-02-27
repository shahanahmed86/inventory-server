const express = require('express');
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const route = express.Router();
const User = require('../models/user');

route.post('/signup', (req, res) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(resp => {
            if (resp) return res.json("Email already exists");
            bcryptjs.hash(req.body.password, 10, (error, hash) => {
                if (error) return res.json({ error });
                const {
                    email, mobile, dob, first, last, gender, maritalStatus, cnic
                } = req.body;
                const user = new User({
                    email, password: hash,
                    mobile, dob, first, last, gender, maritalStatus, cnic
                });
                user.save()
                    .then(() => res.json('Email Created Successfully'))
                    .catch(() => res.json('23 Auth Error'))
            })
        })
        .catch(() => res.json('26 Auth Error'))
});

route.post('/signin', (req, res) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(doc => {
            if (doc) return bcryptjs.compare(req.body.password, doc.password, (err, isMatch) => {
                if (err) return res.json("Password mismatched");
                if (isMatch) {
                    const { _id, email } = doc;
                    const token = jwt.sign({ _id, email }, process.env.SECRET, { expiresIn: '1h' });
                    res.json({ token });
                }
            });
            return res.json("41 Auth Error");
        })
        .catch(() => res.json('43 Auth Error'))
});

module.exports = route;