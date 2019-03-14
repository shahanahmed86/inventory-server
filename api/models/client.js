const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
    clientName: {
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

module.exports = mongoose.model('Client', clientSchema);