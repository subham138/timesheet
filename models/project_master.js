const mongoose = require('mongoose');

const projectMasterSchema = new mongoose.Schema({
    project_code: {
        type: Number,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    project_type_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'md_proj_typ'
    },
    clint_type_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'md_clint_typ'
    },
    po_of_cont_1: {
        type: String
    },
    po_of_cont_2: {
        type: String
    },
    clint_addr: {
        type: String
    },
    contact_no: {
        type: Number
    },
    email: {
        type: String
    },
    proj_frm_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'md_proj_frm'
    },
    buss_exec: {
        type: String
    },
    bill_typ_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'md_bill_typ'
    },
    currency_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'md_currency'
    },
    pro_cost: {
        type: String
    },
    isactive: {
        type: Number,
        default: 1
    }
})

const ProMaster = new mongoose.model("project_master", projectMasterSchema)

module.exports = ProMaster;