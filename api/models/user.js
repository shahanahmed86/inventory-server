const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
    },
    mobile: {
        type: String,
    },
    dob: {
        type: String,
    },
    first: {
        type: String,
    },
    last: {
        type: String,
    },
    gender: {
        type: String,
    },
    maritalStatus: {
        type: String,
    },
    cnic: {
        type: String,
    },
});

module.exports = mongoose.model('User', userSchema);