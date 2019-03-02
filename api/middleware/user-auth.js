const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    try {
        const token = req.header.authentication.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        User.findOne({ _id: decoded._id })
            .exec().then(doc => {
                req.userData = doc;
                next();
            }).catch(() => res.status(401).json('Authentication Error'))
    } catch (error) {
        return res.status(401).json('Authentication Error');
    }
};