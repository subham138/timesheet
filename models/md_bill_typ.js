const mongoose = require('mongoose');

const billTypSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
})

const BillTyp = new mongoose.model("md_bill_typ", billTypSchema)

module.exports = BillTyp;