const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
})

const Currency = new mongoose.model("md_currency", CurrencySchema)

module.exports = Currency;