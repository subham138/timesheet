const mongoose = require('mongoose');

const empSchema = new mongoose.Schema({
    emp_code: {
        type: Number,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    number: {
        type: Number,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    user_type: {
        type: String,
        default: 'U'
    },
    image: {
        type: String,
        default: null
    }
})

const Register = new mongoose.model("user_details", empSchema)

module.exports = Register;