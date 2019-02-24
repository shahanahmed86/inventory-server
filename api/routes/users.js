const express = require('express');
const bcryptjs = require("bcryptjs");
const route = express.Router();
const User = require('../models/user');

route.post('/signup', (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then(resp => {
            if (resp.length > 0) return res.json({
                message: "Email already exists"
            });
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
                    .then(() => res.json({ message: 'Email Created Successfully' }))
                    .catch(error => res.json({ error }))
            })
        })
        .catch(error => res.json({ error }))
});

module.exports = route;