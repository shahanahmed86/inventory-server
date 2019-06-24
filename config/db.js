const mongoose = require('mongoose');

const { USER, PASSWORD } = process.env;
const url = `mongodb://${USER}:${PASSWORD}@ds349455.mlab.com:49455/inventory`;
// const url = `mongodb://localhost:27017/inventory`;

module.exports = mongoose
	.connect(url, {
		useNewUrlParser: true,
		useCreateIndex: true
	})
	.then(() => console.log('mlab is connected'))
	.catch((err) => {
		if (typeof err.errmsg === 'string') return console.log(err.errmsg);
		return console.log('database not connected');
	});
