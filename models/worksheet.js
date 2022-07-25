const mongoose = require('mongoose');

const Worksheet = new mongoose.Schema({
    emp_code: {
        type: Number,
        require: true
        // ,
        // ref: 'md_emp'
    },
    date: {
        type: Date,
        require: true
    },
    project_code: {
        type: String,
        require: true,
        ref: 'project_master'
    },
    work_type: {
        type: String,
        require: true
    },
    work_done: {
        type: String,
        require: true
    },
    hours: {
        type: Number,
        require: true
    }
},
    {
        toObject: { virtuals: true },
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        //toJSON: {virtuals:true} 
    })

// Foreign keys definitions

Worksheet.virtual('emp_id', {
    ref: 'md_emp',
    localField: 'emp_code',
    foreignField: 'emp_code',
    justOne: true // for many-to-1 relationships
});

Worksheet.virtual('project_id', {
    ref: 'project_master',
    localField: 'project_code',
    foreignField: 'project_code',
    justOne: true // for many-to-1 relationships
});

const WorkSheet = new mongoose.model("worksheet", Worksheet)

module.exports = WorkSheet;