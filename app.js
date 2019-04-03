const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRoutes = require('./api/routes/users');
const productRoutes = require('./api/routes/product');
const vendorRoutes = require('./api/routes/vendor');
const clientRoutes = require('./api/routes/client');
const purchaseRoutes = require('./api/routes/purchase');
const saleRoutes = require('./api/routes/sale');

const app = express();

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authentication', 'Authorization'],
}));

const { USER, PASSWORD } = process.env;
const url = `mongodb://${USER}:${PASSWORD}@ds349455.mlab.com:49455/inventory`;
mongoose.connect(url, { useNewUrlParser: true })
    .then(() => console.log('mlab is connected'))
    .catch(err => {
        if (err.errmsg) return console.log(err.errmsg);
        return console.log('database not connected')
    });

app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/vendor', vendorRoutes);
app.use('/client', clientRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/sale', saleRoutes);

module.exports = app;