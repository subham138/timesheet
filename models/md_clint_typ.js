const mongoose = require('mongoose');

const clintTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
})

const ClintType = new mongoose.model("md_clint_typ", clintTypeSchema)

module.exports = ClintType;