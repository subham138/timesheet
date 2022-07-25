const mongoose = require('mongoose');

const mdEmpSchema = new mongoose.Schema({
    emp_code: {
        type: Number,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    }
})

const MdEmp = new mongoose.model("md_emp", mdEmpSchema)

module.exports = MdEmp;