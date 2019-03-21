const mongoose = require('mongoose');

const purchaseSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    invoice: {
        type: String,
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        },
        costPrice: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }]
});

module.exports = mongoose.model('Purchase', purchaseSchema);