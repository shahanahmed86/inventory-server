const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRoutes = require('./api/routes/users');
const productRoutes = require('./api/routes/product');
const vendorRoutes = require('./api/routes/vendor');
const clientRoutes = require('./api/routes/client');
const purchaseRoutes = require('./api/routes/purchase');
const saleRoutes = require('./api/routes/sale');
const paymentRoutes = require('./api/routes/payment');
const recoveryRoutes = require('./api/routes/recovery');

const app = express();

app.use(morgan('dev'));

//JSON parsing/stringify
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//cookie middleware
app.use(cookieParser());

//cors middleware
app.use(
	cors({
		origin: 'http://localhost:3000',
		methods: [ 'GET', 'PUT', 'POST', 'DELETE' ],
		credentials: true,
		allowedHeaders: [ 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authentication', 'Authorization' ]
	})
);

//connecting to the database
require('./config/db');

//routes
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/vendor', vendorRoutes);
app.use('/client', clientRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/sale', saleRoutes);
app.use('/payment', paymentRoutes);
app.use('/recovery', recoveryRoutes);

app.use(express.static('./app/build'));
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'app', 'build', 'index.html'));
});

module.exports = app;
