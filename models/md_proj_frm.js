const mongoose = require('mongoose');

const projFrmSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
})

const ProjFrm = new mongoose.model("md_proj_frm", projFrmSchema)

module.exports = ProjFrm;