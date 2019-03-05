const express = require('express');
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const route = express.Router();

const User = require('../models/user');
const userAuth = require('../middleware/user-auth');

route.post('/signup', (req, res) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(resp => {
            if (resp) return res.status(401).json("Email already exists");
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
                    .then(() => res.status(200).json('Email Created Successfully'))
                    .catch(() => res.status(401).json('Authentication Error'))
            })
        })
        .catch(() => res.status(401).json('Authentication Error'))
});

route.post('/signin', (req, res) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(doc => {
            if (doc) return bcryptjs.compare(req.body.password, doc.password, (err, isMatch) => {
                if (err) return res.status(401).json('Authentication Error');
                if (isMatch) {
                    const { _id, email } = doc;
                    const token = jwt.sign({ _id, email }, process.env.JWT_KEY, { expiresIn: '1h' });
                    return res.status(200).cookie(`token`, token).json('Signed In Successfully');
                }
                return res.status(401).json("Wrong password, please try again");
            });
            return res.status(401).json("Sorry, we don't recognize this email");
        })
        .catch(() => res.status(401).json('Authentication Error'))
});

route.post('/', userAuth, (req, res) => {
    User.findById(req.userData._id)
        .select('cnic dob email first last gender maritalStatus mobile')
        .exec().then(doc => {
            res.status(200).json({ doc });
        }).catch(err => {
            res.status(401).json({ err });
        });
});

module.exports = route;