const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
});

// Prevents a user from signing up with an already registered email address.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);