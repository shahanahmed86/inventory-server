const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const nowTime = Date.now() / 1000;
        if (decoded.exp > nowTime) {
            req.userData = decoded;
            next();
        } else {
            res.status(401).json('Session Expired');
        }
    } catch (error) {
        return res.status(401).json('Authentication failed');
    }
}