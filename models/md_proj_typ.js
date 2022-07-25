const mongoose = require('mongoose');

const projectTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
})

const ProType = new mongoose.model("md_proj_typ", projectTypeSchema)

module.exports = ProType;