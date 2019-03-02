const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/users');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authentication");
    next();
});

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { USER, PASSWORD } = process.env;
const url = `mongodb://${USER}:${PASSWORD}@ds349455.mlab.com:49455/inventory`;
mongoose.connect(url, { useNewUrlParser: true })
    .then(() => console.log('mlab is connected'))
    .catch(err => {
        if (err.errmsg) return console.log(err.errmsg);
        return console.log('database not connected')
    });

app.use('/user', userRoutes);

module.exports = app;