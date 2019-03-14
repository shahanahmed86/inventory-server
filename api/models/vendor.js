const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    vendorName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    telephone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    ntn: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Vendor', vendorSchema);