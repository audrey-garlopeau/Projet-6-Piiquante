const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

var cors = require('cors')

require('dotenv').config()

mongoose.set('strictQuery', true);

mongoose.connect(process.env.DB_ADDRESS,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Succefully connected to MongoDB !'))
  .catch(() => console.log('Failed to connect to MongoDB !'));

const app = express();

// Prevents from CORS errors. Allow our two servers to communicate.
app.use(cors());

// Allows to handle requests.
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;