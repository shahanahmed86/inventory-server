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
                    .catch(() => res.json('Auth Error'))
            })
        })
        .catch(() => res.json('Auth Error'))
});

route.post('/signin', (req, res) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(doc => {
            if (doc) return bcryptjs.compare(req.body.password, doc.password, (err, isMatch) => {
                if (err) return res.json("Password mismatched");
                if (isMatch) {
                    const { email } = req.body;
                    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: '1h' });
                    doc.token = token;
                    doc.save()
                        .then(() => {
                            res.json("Successful Login");
                        })
                        .catch(() => res.json('Auth Error'))
                }
            });
            return res.json("Auth Error");
        })
        .catch(() => res.json('Auth Error'))
});

module.exports = route;